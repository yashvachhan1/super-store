"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Plus, Minus, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity } = useCart();

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 200 ? 0 : 25;
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">

            <main className="max-w-7xl mx-auto px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-6xl font-black uppercase tracking-tighter italic">Your Bag</h1>
                    <p className="text-gray-400 font-medium mt-2">Check your items and head to checkout.</p>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-32 bg-gray-50 rounded-[3rem]">
                        <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-6" />
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-gray-400">Your bag is empty</h2>
                        <Link href="/shop" className="inline-block bg-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-10">
                            {cart.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    key={`${item.id}-${item.size}-${item.color}`}
                                    className="flex flex-col sm:flex-row gap-8 pb-10 border-b border-gray-100 last:border-0 relative group"
                                >
                                    <div className="relative w-40 aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden flex-shrink-0">
                                        <Image src={item.img} alt={item.title} fill className="object-cover" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{item.title}</h3>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.color} • Size {item.size}</p>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                                <X className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-8 sm:mt-0">
                                            <div className="flex items-center gap-6 border-2 border-gray-100 px-6 py-2 rounded-2xl">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-gray-400 transition-colors">
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-gray-400 transition-colors">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className="text-2xl font-bold italic text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Summary Sticky */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-32 space-y-8 bg-zinc-50 p-10 rounded-[3rem]">
                                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-10">Summary</h2>

                                <div className="space-y-6 text-sm font-bold uppercase tracking-widest">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Shipping</span>
                                        <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div className="h-px bg-gray-200" />
                                    <div className="flex justify-between text-xl font-black tracking-tight text-black">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Link href="/checkout" className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-shadow flex items-center justify-center gap-3 group">
                                        Checkout Now
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <p className="text-[9px] text-center mt-6 text-gray-400 font-bold uppercase tracking-[0.2em]">Inclusive of all taxes and duties</p>
                                </div>

                                {/* Trust Badges */}
                                <div className="pt-8 grid grid-cols-1 gap-6 border-t border-gray-200/50">
                                    <div className="flex items-center gap-4">
                                        <ShieldCheck className="w-6 h-6 text-gray-300" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">100% Secure</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">PCI Compliant Payments</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Truck className="w-6 h-6 text-gray-300" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Free Express</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Orders over $200</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

        </div>
    );
}
