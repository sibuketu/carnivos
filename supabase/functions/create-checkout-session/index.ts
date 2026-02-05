import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, message, isPublic, userId, priceId, successUrl, cancelUrl } = await req.json()

        // Determine if this is a subscription or one-time payment
        const isSubscription = !!priceId
        const isGift = !!amount && !priceId

        // Validate input
        if (isGift && (!amount || amount < 100)) {
            throw new Error('Gift amount must be at least 100 yen')
        }
        if (isSubscription && !priceId) {
            throw new Error('Subscription requires priceId')
        }
        if (!isGift && !isSubscription) {
            throw new Error('Must provide either amount (gift) or priceId (subscription)')
        }

        // Initialize Stripe
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
            apiVersion: '2023-10-16',
        })

        // Get origin for redirect URLs
        const origin = req.headers.get('origin') || 'https://carnivos.netlify.app'
        const defaultSuccessUrl = successUrl || `${origin}/?payment=success`
        const defaultCancelUrl = cancelUrl || `${origin}/?payment=canceled`

        let session

        if (isSubscription) {
            // Subscription mode (recurring payment)
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price: priceId, // Use existing Stripe Price ID
                    quantity: 1,
                }],
                mode: 'subscription',
                success_url: `${defaultSuccessUrl}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: defaultCancelUrl,
                metadata: {
                    type: 'subscription',
                    userId: userId || 'anonymous',
                },
                subscription_data: {
                    trial_period_days: 7, // 7-day free trial
                },
            })
        } else {
            // Gift mode (one-time payment)
            session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: 'CarnivOS Gift',
                            description: 'Support new carnivore community members',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `${origin}/?screen=gift&success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/?screen=gift&canceled=true`,
                metadata: {
                    userId: userId || 'anonymous',
                    message: message || '',
                    isPublic: String(isPublic ?? true),
                    type: 'gift',
                },
            })
        }

        return new Response(
            JSON.stringify({ url: session.url, sessionId: session.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Checkout session error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})

