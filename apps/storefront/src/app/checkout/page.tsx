"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Truck, ArrowLeft, CreditCard, Landmark, Apple } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CheckoutPage() {
    const { cart } = useCart();
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 200 ? 0 : 25;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
            {/* Mini Header */}
            <header className="bg-white border-b border-gray-100 py-6 px-8 flex justify-between items-center">
                <Link href="/cart" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Bag
                </Link>
                <div className="text-xl font-black tracking-tighter uppercase absolute left-1/2 -translate-x-1/2">
                    SUPER STORE
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure Checkout</span>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* Checkout Forms */}
                <div className="lg:col-span-7 space-y-12">
                    {/* Progress Tabs */}
                    <div className="flex gap-8">
                        <div className={`flex-1 pb-4 border-b-4 transition-colors ${step >= 1 ? 'border-black' : 'border-gray-100'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest">01 Shipping</span>
                        </div>
                        <div className={`flex-1 pb-4 border-b-4 transition-colors ${step >= 2 ? 'border-black' : 'border-gray-100'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest">02 Payment</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="shipping"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Shipping Address</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="First Name" className="flex-1 bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                    <input type="text" placeholder="Last Name" className="flex-1 bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                </div>
                                <input type="email" placeholder="Email Address" className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                <input type="text" placeholder="Address line 1" className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                <div className="grid grid-cols-3 gap-4">
                                    <input type="text" placeholder="City" className="bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                    <input type="text" placeholder="State" className="bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                    <input type="text" placeholder="ZIP Code" className="bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                </div>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:shadow-2xl transition-shadow"
                                >
                                    Continue to Payment
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-end">
                                    <h2 className="text-4xl font-black uppercase tracking-tighter italic">Payment Method</h2>
                                    <button onClick={() => setStep(1)} className="text-[9px] font-black uppercase tracking-widest text-gray-400 underline mb-2">Edit Shipping</button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="border-2 border-black p-6 rounded-3xl flex flex-col items-center gap-4 cursor-pointer">
                                        <CreditCard className="w-8 h-8" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Card</span>
                                    </div>
                                    <div className="border-2 border-gray-100 p-6 rounded-3xl flex flex-col items-center gap-4 cursor-pointer hover:border-black/20 transition-colors">
                                        <Landmark className="w-8 h-8 text-gray-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Bank</span>
                                    </div>
                                    <div className="border-2 border-gray-100 p-6 rounded-3xl flex flex-col items-center gap-4 cursor-pointer hover:border-black/20 transition-colors">
                                        <Apple className="w-8 h-8 text-gray-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Apple Pay</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <input type="text" placeholder="Card Number" className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="MM / YY" className="bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                        <input type="text" placeholder="CVC" className="bg-white border border-gray-100 p-4 rounded-2xl text-sm font-bold placeholder:text-gray-300 focus:border-black outline-none transition-colors" />
                                    </div>
                                </div>

                                <button className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:shadow-2xl transition-shadow">
                                    Complete Purchase • ${total.toFixed(2)}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-5">
                    <div className="bg-white p-10 rounded-[3rem] sticky top-32 border border-gray-100">
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 leading-none">Order Summary</h3>

                        <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 -mr-4 mb-8">
                            {cart.map(item => (
                                <div key={`${item.id}-${item.size}`} className="flex gap-4">
                                    <div className="relative w-16 aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                        <Image src={item.img} alt={item.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{item.title}</h4>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.color} • Size {item.size} • Qty {item.quantity}</p>
                                    </div>
                                    <span className="text-sm font-bold italic text-gray-400 self-center">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 border-t border-gray-50 pt-8">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                <span>Subtotal</span>
                                <span className="text-black">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                <span>Shipping</span>
                                <span className="text-black uppercase">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black uppercase tracking-tighter pt-4">
                                <span>Total</span>
                                <span className="italic">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <Truck className="w-5 h-5 text-gray-300" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Arrives in 2-4 business days</span>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-3xl">
                                <p className="text-[9px] font-bold text-gray-400 leading-relaxed italic uppercase tracking-widest">&quot;Refining the way you wear the future. Your order is handled with the utmost care by our technical delivery crew.&quot;</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mini Footer */}
            <footer className="py-12 flex flex-col items-center gap-4 text-gray-300 font-bold uppercase tracking-[0.4em] text-[8px]">
                <span>Super Store © 2026</span>
                <div className="flex gap-8">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Support</a>
                </div>
            </footer>
        </div>
    );
}


