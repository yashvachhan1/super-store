"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
    const { addToCart } = useCart();
    const { wishlist, toggleWishlist } = useWishlist();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">

            <main className="max-w-7xl mx-auto px-8 py-16">
                <div className="mb-16">
                    <h1 className="text-6xl font-black uppercase tracking-tighter italic">Saved for later</h1>
                    <p className="text-gray-400 font-medium mt-2">Your personal collection of future classics.</p>
                </div>

                {wishlist.length === 0 ? (
                    <div className="text-center py-32 bg-gray-50 rounded-[3rem]">
                        <Heart className="w-16 h-16 mx-auto text-gray-200 mb-6" />
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-gray-400">Your wishlist is empty</h2>
                        <Link href="/shop" className="inline-block bg-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                        {wishlist.map((prod) => (
                            <motion.div
                                layout
                                key={prod.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative"
                            >
                                <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden mb-6 rounded-3xl">
                                    <Image
                                        src={prod.img}
                                        alt={prod.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <button
                                        onClick={() => toggleWishlist(prod)}
                                        className="absolute top-6 right-6 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-sm hover:bg-white transition-colors text-black"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => addToCart({ ...prod, quantity: 1, color: "Default", size: "M" })}
                                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                                    >
                                        Move to Bag
                                    </button>
                                </div>
                                <div className="px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">{prod.cat}</span>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-black text-xl uppercase tracking-tighter leading-none">{prod.title}</h3>
                                        <span className="font-bold text-lg italic text-gray-400">${prod.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

        </div>
    );
}
