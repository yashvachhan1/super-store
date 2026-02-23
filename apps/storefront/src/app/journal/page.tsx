"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

interface Blog {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    image: string;
    createdAt?: any;
}

export default function JournalPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const q = query(
                    collection(db, "blogs"),
                    where("status", "==", "Published")
                );
                const querySnapshot = await getDocs(q);
                const fetchedBlogs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Blog[];

                // Sort manually if createdAt exists to avoid missing index errors
                fetchedBlogs.sort((a, b) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA;
                });

                setBlogs(fetchedBlogs);
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Loading Journal...</p>
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-white px-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">The Journal is currently empty</h1>
                    <p className="text-gray-400 font-medium uppercase text-[10px] tracking-widest">Editorial process in progress. Check back soon.</p>
                </div>
                <Link href="/" className="px-10 py-5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            {/* Refined Hero (Direct Image) */}
            <section className="h-[88vh] flex flex-col pt-8 overflow-hidden bg-white">
                {/* Image Area */}
                <div className="flex-1 px-8 pb-12">
                    <Link href={`/journal/${blogs[0].slug}`} className="group relative block w-full h-full rounded-[3rem] overflow-hidden bg-gray-100 shadow-2xl">
                        <Image src={blogs[0].image} alt={blogs[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
                        <div className="absolute bottom-10 left-12 right-12 text-white flex justify-between items-end">
                            <div>
                                <span className="text-xs font-black uppercase tracking-widest mb-2 block">{blogs[0].category}</span>
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">{blogs[0].title}</h2>
                            </div>
                            <div className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                Read Story <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Grid Area */}
            {blogs.length > 1 && (
                <section className="px-8 border-t border-gray-100 py-12">
                    <div className="max-w-[1500px] mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                            {blogs.slice(1).map((blog, idx) => (
                                <motion.div
                                    key={blog.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="group"
                                >
                                    <Link href={`/journal/${blog.slug}`} className="block relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-100 mb-8">
                                        <Image src={blog.image} alt={blog.title} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                                    </Link>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{blog.category}</span>
                                            <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{blog.date}</span>
                                        </div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none group-hover:translate-x-2 transition-transform">{blog.title}</h3>
                                        <p className="text-gray-400 font-medium leading-relaxed line-clamp-2 uppercase text-xs tracking-wider">{blog.excerpt}</p>
                                        <Link href={`/journal/${blog.slug}`} className="inline-flex items-center gap-2 pt-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest border-b border-gray-100 group-hover:border-black transition-colors">Discover</span>
                                            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Newsletter Minimal */}
            <section className="py-40 bg-gray-50 text-center px-8 border-t border-gray-100">
                <h2 className="text-5xl font-black uppercase tracking-tighter mb-8 italic">The Weekly Digest.</h2>
                <p className="text-gray-400 font-medium uppercase text-[10px] tracking-[0.4em] mb-12">No Noise. Just Narrative.</p>
                <div className="max-w-md mx-auto relative group">
                    <input type="email" placeholder="Your Email" className="w-full bg-transparent border-b-2 border-gray-200 py-4 outline-none font-black uppercase tracking-widest text-sm focus:border-black transition-colors" />
                    <button className="absolute right-0 bottom-4 font-black uppercase tracking-widest text-[10px] hover:scale-110 transition-transform">Subscribe</button>
                </div>
            </section>
        </main>
    );
}
