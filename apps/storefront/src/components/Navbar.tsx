"use client";

import Link from "next/link";
import { Search, Menu, User, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function Navbar() {
    const { cart, setIsMenuOpen } = useCart();
    const { user } = useAuth();

    const initials = user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : "U";

    return (
        <nav className="relative md:sticky top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="flex items-center gap-4 md:gap-6">
                <Menu
                    onClick={() => setIsMenuOpen(true)}
                    className="w-5 h-5 md:w-6 md:h-6 cursor-pointer hover:rotate-90 transition-transform duration-300"
                />
                <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
                    <Link href="/shop" className="hover:text-black/50 transition-colors">Catalog</Link>
                    <a href="#" className="hover:text-black/50 transition-colors">New Arrivals</a>
                    <Link href="/journal" className="hover:text-black/50 transition-colors">Journal</Link>
                    <a href="#" className="hover:text-black/50 transition-colors">Archive</a>
                </nav>
            </div>

            <div className="text-lg md:text-2xl font-black tracking-tighter uppercase absolute left-1/2 -translate-x-1/2">
                <Link href="/">SUPER STORE</Link>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                <Search className="w-4 h-4 md:w-5 md:h-5 cursor-pointer hover:scale-110 transition-transform" />
                <Link href="/account" className="hidden md:block">
                    {user ? (
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black hover:scale-110 transition-transform">
                            {initials}
                        </div>
                    ) : (
                        <User className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
                    )}
                </Link>
                <Link href="/wishlist" className="hidden md:block">
                    <Heart className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
                </Link>
                <Link href="/cart" className="relative group cursor-pointer">
                    <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[7px] md:text-[8px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</span>
                </Link>
            </div>
        </nav>
    );
}
