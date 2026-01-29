"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createCheckoutSession = exports.createStripeCheckoutSession = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
// Firebase Admin初期化
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Helper to get Stripe instance (Lazy Initialization)
const getStripe = () => {
    // 1. Try process.env (Standard)
    let key = process.env.STRIPE_SECRET_KEY;
    // 2. Try Firebase Config (Legacy/CLI: firebase functions:config:set stripe.secret_key="...")
    if (!key) {
        try {
            key = functions.config().stripe?.secret_key;
        }
        catch (e) {
            // Ignore config error in local/test env
            console.log('No functions.config() available');
        }
    }
    if (!key) {
        console.warn('STRIPE_SECRET_KEY is not set');
        // Return a dummy instance for analysis/build time safety
        return new stripe_1.default('dummy_key_for_analysis', { apiVersion: '2025-02-24.acacia' });
    }
    return new stripe_1.default(key, {
        apiVersion: '2025-02-24.acacia',
    });
};
/**
 * サブスクリプション用Checkout Session作成
 * PaywallScreenから呼び出される
 */
exports.createStripeCheckoutSession = functions.https.onCall(async (data, context) => {
    // 認証チェック（匿名認証も許可）
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { successUrl, cancelUrl, interval } = data;
    // 必須パラメータチェック
    if (!successUrl || !cancelUrl || !interval) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters: successUrl, cancelUrl, interval');
    }
    // 価格ID取得
    const priceId = interval === 'month'
        ? process.env.STRIPE_PRICE_ID_MONTHLY
        : process.env.STRIPE_PRICE_ID_YEARLY;
    if (!priceId) {
        throw new functions.https.HttpsError('failed-precondition', `Stripe price ID not configured for ${interval} plan`);
    }
    const userId = context.auth.uid;
    try {
        // Stripe Checkout Session作成
        const session = await getStripe().checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: 7,
                metadata: {
                    userId,
                },
            },
            customer_email: context.auth.token.email || undefined,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId,
                interval,
            },
        });
        return { url: session.url };
    }
    catch (error) {
        console.error('Stripe Checkout Session creation error:', error);
        throw new functions.https.HttpsError('internal', `Failed to create checkout session: ${error.message}`);
    }
});
/**
 * ワンタイム決済用Checkout Session作成
 * ShopScreen / GiftScreenから呼び出される
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    // 認証チェック（匿名認証も許可）
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { amount, currency, metadata, successUrl, cancelUrl } = data;
    // 必須パラメータチェック
    if (!amount || !currency) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters: amount, currency');
    }
    const userId = context.auth.uid;
    try {
        // Stripe Checkout Session作成（ワンタイム決済）
        const session = await getStripe().checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase(),
                        product_data: {
                            name: metadata?.itemName || 'Primal Logic Purchase',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            customer_email: context.auth.token.email || undefined,
            success_url: successUrl || `${process.env.APP_URL || ''}/?payment_success=true`,
            cancel_url: cancelUrl || `${process.env.APP_URL || ''}/?payment_cancel=true`,
            metadata: {
                userId,
                ...metadata,
            },
        });
        return { sessionId: session.id, url: session.url };
    }
    catch (error) {
        console.error('Stripe Checkout Session creation error:', error);
        throw new functions.https.HttpsError('internal', `Failed to create checkout session: ${error.message}`);
    }
});
/**
 * Stripe Webhook処理
 * サブスクリプション状態の同期
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
        res.status(400).send('Missing stripe-signature header');
        return;
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        res.status(500).send('Webhook secret not configured');
        return;
    }
    let event;
    try {
        event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    try {
        // サブスクリプション関連のイベントを処理
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata?.userId;
            if (userId && session.mode === 'subscription') {
                const subscriptionId = session.subscription;
                // Firestoreにサブスクリプション情報を保存
                await db.collection('subscriptions').doc(userId).set({
                    subscriptionId,
                    status: 'active',
                    userId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }
        // サブスクリプション更新イベント
        if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object;
            const userId = subscription.metadata?.userId;
            if (userId) {
                await db.collection('subscriptions').doc(userId).set({
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    userId,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }
        // サブスクリプション削除イベント
        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            const userId = subscription.metadata?.userId;
            if (userId) {
                await db.collection('subscriptions').doc(userId).set({
                    subscriptionId: subscription.id,
                    status: 'canceled',
                    userId,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send(`Webhook processing error: ${error.message}`);
    }
});
//# sourceMappingURL=index.js.map