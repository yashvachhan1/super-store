"use client";

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

// You must provide your own Publishable Key from Stripe Dashboard
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function CheckoutForm({ total }: { total: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        // This is where you would call your backend to create a Payment Intent
        // and then confirm the payment on the client side.

        setError("Live Stripe keys required for real transactions.");
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-white border border-gray-100 rounded-2xl">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#000',
                            '::placeholder': { color: '#aab7c4' },
                        },
                    },
                }} />
            </div>
            {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest">{error}</p>}
            <button
                disabled={!stripe || loading}
                className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:shadow-2xl transition-shadow disabled:opacity-50"
            >
                {loading ? "Processing..." : `Complete Purchase • $${total.toFixed(2)}`}
            </button>
        </form>
    );
}

export default function StripePayment({ total }: { total: number }) {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm total={total} />
        </Elements>
    );
}
