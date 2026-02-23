"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, User, ShoppingBag, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function MobileMenu() {
    const { isMenuOpen, setIsMenuOpen, cart } = useCart();
    const { user } = useAuth();

    const menuItems = [
        { label: "Catalog", href: "/shop" },
        { label: "New Arrivals", href: "#" },
        { label: "Journal", href: "/journal" },
        { label: "Archive", href: "#" },
    ];

    return (
        <AnimatePresence>
            {isMenuOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm lg:hidden"
                    />

                    {/* Menu Drawer */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-screen w-full max-w-[300px] bg-white z-[101] shadow-2xl flex flex-col lg:hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-xl font-black tracking-tighter uppercase italic">Menu</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                            {menuItems.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-2xl font-black uppercase tracking-tighter italic hover:translate-x-2 transition-transform"
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="h-px bg-gray-100 my-4" />

                            <div className="space-y-6">
                                <Link
                                    href="/wishlist"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400"
                                >
                                    <Heart className="w-5 h-5" /> Wishlist
                                </Link>
                                <Link
                                    href="/account"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400"
                                >
                                    <User className="w-5 h-5" /> Account
                                </Link>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-zinc-50 space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Curated for Excellence</p>
                            <Link
                                href="/cart"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-between bg-black text-white p-6 rounded-2xl"
                            >
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">Cart</span>
                                </div>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">{cart.length} Files</span>
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
