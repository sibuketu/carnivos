import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
        apiVersion: '2023-10-16',
    })

    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

    try {
        const body = await req.text()

        // Verify webhook signature
        const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)

        // Handle checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session

            // Handle Gift Payments
            if (session.metadata?.type === 'gift') {
                // Initialize Supabase client
                const supabase = createClient(
                    Deno.env.get('SUPABASE_URL')!,
                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
                )

                // Get current month in YYYY-MM format
                const now = new Date()
                const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

                // Save gift to database
                const { error } = await supabase.from('gifts').insert({
                    user_id: session.metadata.userId !== 'anonymous' ? session.metadata.userId : null,
                    amount: session.amount_total,
                    month: month,
                    message: session.metadata.message || null,
                    is_public: session.metadata.isPublic === 'true',
                    payment_provider: 'stripe',
                    transaction_id: session.id,
                })

                if (error) {
                    console.error('Failed to save gift:', error)
                    throw error
                }

                console.log('Gift saved successfully:', session.id)
            }

            // Handle Subscription Payments
            if (session.mode === 'subscription') {
                const supabase = createClient(
                    Deno.env.get('SUPABASE_URL')!,
                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
                )

                const userId = session.client_reference_id;
                const subscriptionId = session.subscription as string;

                if (userId && subscriptionId) {
                    const { error } = await supabase.from('profiles')
                        .update({
                            subscription_status: 'active',
                            subscription_id: subscriptionId,
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', userId);

                    if (error) console.error('Error updating profile for subscription:', error);
                    else console.log(`Subscription activated for user: ${userId}`);
                }
            }
        }

        // Handle Subscription Updates (Renewals, Changes)
        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription;
            const supabase = createClient(
                Deno.env.get('SUPABASE_URL')!,
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            )

            const { error } = await supabase.from('profiles')
                .update({
                    subscription_status: subscription.status,
                    subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('subscription_id', subscription.id);

            if (error) console.error('Error updating subscription status:', error);
            else console.log(`Subscription updated: ${subscription.id}`);
        }

        // Handle Subscription Deletion (Cancellations)
        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            const supabase = createClient(
                Deno.env.get('SUPABASE_URL')!,
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            )

            const { error } = await supabase.from('profiles')
                .update({
                    subscription_status: 'canceled', // or 'free' depending on logic
                    updated_at: new Date().toISOString()
                })
                .eq('subscription_id', subscription.id);

            if (error) console.error('Error cancelling subscription:', error);
            else console.log(`Subscription deleted: ${subscription.id}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
