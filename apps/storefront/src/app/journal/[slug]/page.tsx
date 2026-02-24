"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Share2, Facebook, Twitter, Instagram, Loader2 } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

interface BlogPost {
    id?: string;
    slug: string;
    title: string;
    subtitle?: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    image: string;
    content: string;
    excerpt?: string;
}

export default function JournalPostPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const containerRef = useRef<HTMLDivElement>(null);
    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
    const progressWidth = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    useEffect(() => {
        const fetchBlog = async () => {
            if (!slug) return;
            try {
                const q = query(
                    collection(db, "blogs"),
                    where("slug", "==", slug),
                    limit(1)
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const data = querySnapshot.docs[0].data();
                    setBlog({
                        slug: slug,
                        title: data.title,
                        subtitle: data.subtitle || data.excerpt,
                        category: data.category,
                        author: data.author || "Yash Vardhan",
                        date: data.date,
                        readTime: data.readTime || "5 min read",
                        image: data.image,
                        content: data.content
                    });

                    // Fetch Related Blogs
                    const relatedQ = query(
                        collection(db, "blogs"),
                        where("status", "==", "Published"),
                        limit(4) // Fetch one extra in case current one is included
                    );
                    const relatedSnap = await getDocs(relatedQ);
                    const filteredRelated = relatedSnap.docs
                        .map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
                        .filter((b) => b.slug !== slug)
                        .slice(0, 3);
                    setRelatedBlogs(filteredRelated);
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

    return (
        <div ref={containerRef} className="bg-white min-h-screen font-sans selection:bg-black selection:text-white">
            {loading ? (
                <div className="h-screen flex flex-col items-center justify-center gap-4 bg-black text-white">
                    <Loader2 className="w-10 h-10 animate-spin text-white/50" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Accessing Digital Manuscript...</p>
                </div>
            ) : !blog ? (
                <div className="h-screen flex flex-col items-center justify-center gap-8 bg-white px-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Manuscript Missing</h1>
                        <p className="text-gray-400 font-medium uppercase text-[10px] tracking-widest">The requested narrative has been redacted or moved.</p>
                    </div>
                    <button onClick={() => router.push('/journal')} className="px-10 py-5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                        Return to Library
                    </button>
                </div>
            ) : (
                <>
                    {/* Reading Progress Bar */}
                    <motion.div
                        className="fixed top-0 left-0 h-1 bg-black z-[100] origin-left"
                        style={{ scaleX: progressWidth }}
                    />

                    {/* Immersive Hybrid Hero */}
                    <section className="relative h-screen w-full overflow-hidden flex items-end bg-black">
                        <motion.div
                            style={{ scale, opacity: heroOpacity }}
                            className="absolute inset-0 z-0"
                        >
                            <Image
                                src={blog.image}
                                alt={blog.title}
                                fill
                                className="object-cover brightness-50 grayscale hover:grayscale-0 transition-all duration-[3s]"
                                priority
                            />
                        </motion.div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />

                        <div className="relative z-20 w-full px-8 pb-24 md:pb-32 max-w-7xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-6">
                                    <Link href="/journal" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group backdrop-blur-md">
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </Link>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">{blog.category}</span>
                                </div>

                                <h1 className="text-5xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] text-white italic drop-shadow-2xl">
                                    {blog.title.split(' ').map((word, i) => (
                                        <span key={i} className="inline-block mr-[0.2em]">{word}</span>
                                    ))}
                                </h1>

                                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16 pt-8 border-t border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden border border-white/20">
                                            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-black" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Curator</p>
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">{blog.author}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Date</p>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">{blog.date}</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Read</p>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">{blog.readTime}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 z-20 hidden md:block"
                        >
                            <div className="w-px h-16 bg-gradient-to-b from-white/50 to-transparent mx-auto" />
                        </motion.div>
                    </section>

                    {/* Reading Experience */}
                    <section className="relative py-32 px-8">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
                            {/* Share & Meta Sidebar (Sticky) */}
                            <div className="lg:col-span-3 hidden lg:block">
                                <div className="sticky top-32 space-y-12">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Share Story</h4>
                                        <div className="flex flex-col gap-4">
                                            <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all"><Twitter className="w-4 h-4" /></button>
                                            <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all"><Facebook className="w-4 h-4" /></button>
                                            <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all"><Instagram className="w-4 h-4" /></button>
                                            <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all"><Share2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-12 border-t border-gray-100">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {['Footwear', 'Guide', 'Premium', 'Care', 'Science'].map(tag => (
                                                <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 px-3 py-1.5 rounded-md hover:bg-black hover:text-white transition-all cursor-pointer">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Article Content */}
                            <div className="lg:col-span-8 space-y-16">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-8"
                                >
                                    <p className="text-3xl md:text-4xl font-black uppercase leading-[1.1] tracking-tighter italic whitespace-pre-wrap">
                                        {blog.subtitle || blog.content.substring(0, 200) + "..."}
                                    </p>
                                    <div className="flex items-center gap-4 py-8">
                                        <div className="h-0.5 flex-1 bg-gray-100" />
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">The Philosophy</span>
                                        <div className="h-0.5 w-12 bg-gray-100" />
                                    </div>
                                </motion.div>

                                <div className="prose prose-zinc max-w-none">
                                    <div className="text-xl text-gray-500 leading-relaxed font-medium whitespace-pre-wrap">
                                        {blog.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Related Narratives */}
                    <section className="py-32 bg-gray-50 border-t border-gray-100 px-8">
                        <div className="max-w-7xl mx-auto space-y-20">
                            <div className="flex justify-between items-end">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">More Volumes</span>
                                    <h2 className="text-5xl font-black uppercase tracking-tighter italic">Stay Immersed</h2>
                                </div>
                                <Link href="/journal" className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-gray-500 transition-colors">See the Full Index</Link>
                            </div>

                            {relatedBlogs.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                    {relatedBlogs.map((post, i) => (
                                        <Link key={i} href={`/journal/${post.slug}`} className="group space-y-6">
                                            <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-white">
                                                <Image src={post.image} alt={post.title} fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{post.category}</span>
                                                <h3 className="text-2xl font-black uppercase tracking-tighter group-hover:translate-x-2 transition-transform italic">{post.title}</h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
