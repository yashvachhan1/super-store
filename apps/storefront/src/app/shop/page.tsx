"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface Product {
    id: string;
    name: string;
    title?: string; // For compatibility
    category: string;
    cat?: string; // For compatibility
    brand: string;
    price: number;
    images: string[];
    img?: string; // For compatibility
    type: string;
}

export default function ShopPage() {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All Items");

    useEffect(() => {
        const qProducts = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsubProducts = onSnapshot(qProducts, (snapshot) => {
            const productData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    title: data.name, // compatibility
                    cat: data.category, // compatibility
                    img: data.images?.[0] || "" // compatibility
                } as Product;
            });
            setProducts(productData);
            setLoading(false);
        });

        const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        });

        return () => { unsubProducts(); unsubCats(); };
    }, []);

    const filteredProducts = selectedCategory === "All Items"
        ? products
        : products.filter(p => p.category === selectedCategory);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <main className="max-w-[1800px] mx-auto px-8 py-12">
                {/* Header & Filter Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-4">
                    <div>
                        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 italic">The Collection</h1>
                        <p className="text-gray-400 font-medium">Showing {filteredProducts.length} refined pieces for your modern aesthetic.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-between gap-10 px-6 py-4 border border-gray-200 rounded-full font-bold uppercase tracking-widest text-[10px] hover:border-black transition-colors">
                            Sort By <ChevronDown className="w-4 h-4" />
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-colors">
                            <SlidersHorizontal className="w-4 h-4" /> Filter
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 space-y-12">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6">Categories</h3>
                            <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-gray-400">
                                <li
                                    className={`${selectedCategory === "All Items" ? "text-black" : "hover:text-black"} transition-colors cursor-pointer`}
                                    onClick={() => setSelectedCategory("All Items")}
                                >
                                    All Items
                                </li>
                                {categories.map(cat => (
                                    <li
                                        key={cat.id}
                                        className={`${selectedCategory === cat.name ? "text-black" : "hover:text-black"} transition-colors cursor-pointer`}
                                        onClick={() => setSelectedCategory(cat.name)}
                                    >
                                        {cat.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-black" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Syncing Collection...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-400 font-medium uppercase text-[10px] tracking-widest">No pieces found in this category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-16">
                                {filteredProducts.map((prod) => (
                                    <div key={prod.id} className="relative group">
                                        <Link href={`/shop/${prod.id}`}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5 }}
                                                className="cursor-pointer"
                                            >
                                                <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden mb-6 rounded-3xl">
                                                    <Image
                                                        src={prod.img || "/placeholder.png"}
                                                        alt={prod.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    />
                                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="px-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">{prod.category}</span>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-black text-xl uppercase tracking-tighter leading-none">{prod.name}</h3>
                                                        <span className="font-bold text-lg italic text-gray-400">${prod.price}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>

                                        <button
                                            onClick={() => toggleWishlist({
                                                id: prod.id,
                                                title: prod.name,
                                                price: prod.price,
                                                img: prod.img || "",
                                                cat: prod.category
                                            })}
                                            className="absolute top-6 right-6 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-sm hover:bg-white transition-colors z-20"
                                        >
                                            <Heart className={`w-4 h-4 transition-colors ${isInWishlist(prod.id) ? 'fill-red-500 stroke-red-500' : 'text-gray-400'}`} />
                                        </button>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCart({
                                                    id: prod.id,
                                                    title: prod.name,
                                                    price: prod.price,
                                                    img: prod.img || "",
                                                    quantity: 1,
                                                    color: "Default",
                                                    size: "M"
                                                });
                                            }}
                                            className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-10"
                                        >
                                            Add to Bag
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination / Load More */}
                        {!loading && filteredProducts.length > 0 && (
                            <div className="mt-24 flex flex-col items-center">
                                <div className="w-64 h-1 bg-gray-100 mb-8 rounded-full overflow-hidden">
                                    <div className="w-1/3 h-full bg-black rounded-full" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-8">Showing {filteredProducts.length} Items</p>
                                <button className="px-12 py-5 border-2 border-black rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-black hover:text-white transition-all duration-300">
                                    View More Pieces
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
