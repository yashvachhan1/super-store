import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
});

interface CartItem {
    price: number;
    quantity: number;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { cart, address, paymentMethod } = body;

        // 1. Calculate Total (Server-side validation)
        const subtotal = cart.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
        const shipping = subtotal > 200 ? 0 : 25;
        const total = subtotal + shipping;

        // 2. Process based on Payment Method
        if (paymentMethod === 'cod' || paymentMethod === 'bank') {
            const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            return NextResponse.json({
                success: true,
                orderId
            });
        }

        if (paymentMethod === 'card') {
            // Create Stripe Payment Intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(total * 100), // Stripe uses cents
                currency: 'usd',
                payment_method_types: ['card'],
                metadata: {
                    order_type: 'storefront_purchase'
                }
            });

            return NextResponse.json({
                success: true,
                clientSecret: paymentIntent.client_secret
            });
        }

        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

    } catch (err: unknown) {
        console.error('Checkout error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
