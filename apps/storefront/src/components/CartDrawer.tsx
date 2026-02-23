"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
    const { cart, isDrawerOpen, setIsDrawerOpen, removeFromCart, updateQuantity } = useCart();

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsDrawerOpen(false)}
                        className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Your Bag ({cart.length})</h2>
                            <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Your bag is empty</p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="flex gap-6 pb-6 border-b border-gray-50 last:border-0 relative group">
                                        <div className="relative w-24 aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                                            <Image src={item.img} alt={item.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-sm font-black uppercase tracking-tight leading-none mb-1">{item.title}</h3>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-black">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.color} • {item.size}</p>
                                            </div>

                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex items-center gap-4 bg-gray-50 px-4 py-1.5 rounded-full scale-90 -ml-2">
                                                    <button onClick={() => updateQuantity(item.id, -1)}><Minus className="w-3 h-3" /></button>
                                                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)}><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <span className="text-sm font-bold italic text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Summary */}
                        {cart.length > 0 && (
                            <div className="p-8 bg-zinc-50 space-y-6">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-xl tracking-tighter">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="space-y-3">
                                    <Link
                                        href="/cart"
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:shadow-xl transition-shadow"
                                    >
                                        View Full Bag
                                    </Link>
                                    <Link
                                        href="/checkout"
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 border-2 border-black/10 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:border-black transition-colors group"
                                    >
                                        Checkout <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                <p className="text-[8px] text-center text-gray-400 uppercase tracking-widest font-bold">Shipping & Taxes calculated at checkout</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
