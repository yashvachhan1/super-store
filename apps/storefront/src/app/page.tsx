"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight, ArrowRight, Play, ShoppingBag, Search, Menu, User, Instagram, Twitter, Facebook, Plus, Minus, X, ArrowUpRight, Heart, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { collection, onSnapshot, query, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
}

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const { cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">

      {/* Top Announcement Marquee */}
      <div className="bg-black text-white py-2 overflow-hidden whitespace-nowrap border-b border-white/10">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="inline-block text-[10px] font-bold uppercase tracking-[0.4em]"
        >
          Free International Shipping on Orders over $200 • Limited Edition Drop: Neo Gravity 2.0 Out Now • Global Curated Aesthetics • Free International Shipping on Orders over $200 • Limited Edition Drop: Neo Gravity 2.0 Out Now • Global Curated Aesthetics •
        </motion.div>
      </div>

      {/* Hero Section - Even Bigger Typography */}
      <section className="relative w-full h-[90vh] overflow-hidden flex items-center justify-center p-8">
        <div className="absolute inset-0 z-0 scale-105">
          <Image
            src="/hero.png"
            alt="Hero Image"
            fill
            className="object-cover brightness-[0.85]"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="uppercase text-white/90 font-bold tracking-[0.5em] mb-6 text-xs bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">Summer 2026 Collection</span>
            <h1 className="text-7xl md:text-[11rem] font-black text-white uppercase tracking-tighter leading-[0.85] mb-12 drop-shadow-2xl">
              Future <br /> <span className="text-transparent border-text stroke-white" style={{ WebkitTextStroke: "2px white" }}>Aesthetic</span>.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex gap-4"
          >
            <Link href="/shop" className="group flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all duration-300">
              Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group flex items-center gap-3 bg-white/10 backdrop-blur-xl text-white border border-white/30 px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-white/20 transition-all duration-300">
              Explore Film
            </button>
          </motion.div>
        </div>
      </section>

      {/* Brand Trust Section */}
      <div className="py-12 border-y border-gray-100 flex justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 overflow-hidden">
        <div className="flex gap-20 items-center justify-center px-8 flex-wrap">
          <span className="text-xl font-bold tracking-tighter uppercase italic">VOGUE</span>
          <span className="text-xl font-bold tracking-tighter uppercase">Hypebeast</span>
          <span className="text-xl font-bold tracking-tighter uppercase italic">GQ</span>
          <span className="text-xl font-bold tracking-tighter uppercase tracking-[0.2em]">ELLE</span>
          <span className="text-xl font-bold tracking-tighter uppercase italic underline">Forbes</span>
          <span className="text-xl font-bold tracking-tighter uppercase">Esquire</span>
        </div>
      </div>

      {/* Grid Highlights */}
      <section className="py-32 px-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-2xl group">
            <Image src="/lifestyle.png" alt="Lifestyle" fill className="object-cover group-hover:scale-110 transition-transform duration-[3s]" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            <div className="absolute bottom-12 left-12">
              <span className="text-white text-xs font-bold uppercase tracking-[0.4em] mb-4 block">The Philosophy</span>
              <h3 className="text-white text-4xl font-black uppercase tracking-tighter mb-6">Designed for <br /> Modern Living.</h3>
              <button className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="space-y-12 pl-0 lg:pl-12">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Beyond <br /> Convenience. <br /> <span className="text-gray-300">Pure Quality.</span>
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
              We believe in objects that last. Our pieces are meticulously curated from global artisans, ensuring every item in your Super Store experience is nothing short of exceptional.
            </p>
            <div className="flex gap-8 pt-8 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-3xl font-black italic tracking-tighter">98%+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer Love</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black italic tracking-tighter">24hr</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Rapid Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Categories */}
      <section className="py-24 px-8 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 px-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 mb-2 block">Departments</span>
              <h2 className="text-5xl font-black uppercase tracking-tighter">Shop by Mood</h2>
            </div>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 cursor-pointer hover:text-gray-500 transition-colors hidden md:block">Explore All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative h-[80vh] md:col-span-2 group overflow-hidden bg-gray-100 rounded-3xl cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" alt="Women" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="text-3xl font-black uppercase tracking-tight mb-2">Iconic Women</h3>
                <p className="text-sm font-medium text-white/70 italic uppercase tracking-widest">Minimalist Essentials</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:col-span-2">
              <div className="relative h-[39vh] group overflow-hidden bg-gray-100 rounded-3xl cursor-pointer">
                <Image src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000&auto=format&fit=crop" alt="Men" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Structured Men</h3>
                </div>
              </div>
              <div className="relative h-[39vh] group overflow-hidden bg-gray-100 rounded-3xl cursor-pointer">
                <Image src="/product1.png" alt="Accessories" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Statement Pieces</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Layout - More Items */}
      <section className="py-32 px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center mb-24">
          <span className="text-xs font-bold uppercase tracking-[0.5em] text-gray-400 mb-6 block">The Curated List</span>
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 italic">Trending Now</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Loading Pieces...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-medium uppercase text-[10px] tracking-widest">Our curation is being refreshed. Stay tuned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-12">
            {products.map((prod) => (
              <Link href={`/shop/${prod.id}`} key={prod.id}>
                <motion.div
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden mb-6 rounded-2xl">
                    <Image src={prod.images?.[0] || "/placeholder.png"} alt={prod.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <button className="absolute bottom-6 right-6 bg-white text-black w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">{prod.category}</span>
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-xl uppercase tracking-tight">{prod.name}</h3>
                      <span className="font-bold text-lg italic text-gray-50">${prod.price}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* The Journal Section - Highly Visual Editorial */}
      <section className="py-32 px-8 bg-black text-white relative overflow-hidden mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto relative z-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.5em] text-white/50 mb-8 block">Volume 01: The Essence</span>
            <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-10">
              A Visual <br /> <span className="italic">Dialogue</span> <br /> Between <br /> Art & Style.
            </h2>
            <p className="text-lg text-white/60 mb-12 max-w-md leading-relaxed">
              Super Store captures the moments where fashion meets functionality. Read our latest editorial on how minimalist design is shaping the next decade.
            </p>
            <a href="#" className="inline-flex items-center gap-4 group">
              <span className="text-sm font-black uppercase tracking-[0.2em] border-b-2 border-white/20 group-hover:border-white transition-colors pb-1">Read the Journal</span>
              <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden group">
            <Image src="/journal.png" alt="Editorial" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
            <div className="absolute inset-0 border-[20px] border-black pointer-events-none" />
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 text-[20vw] font-black text-white/5 select-none pointer-events-none translate-x-1/4 -translate-y-1/4 uppercase italic tracking-tighter leading-none">
          EDITORIAL
        </div>
      </section>

      {/* Modern Newsletter CTA */}
      <section className="bg-white text-black py-40 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 mt-4 leading-none">Stay in the Loop.</h2>
        <p className="text-gray-500 max-w-xl mb-12 text-xl font-medium">Join our global community of aesthetes. Get early access to seasonal drops and exclusive curations.</p>

        <div className="flex w-full max-w-lg border-b-4 border-black focus-within:border-black/30 transition-colors py-4">
          <input type="email" placeholder="Email Address" className="bg-transparent outline-none flex-1 text-2xl font-black uppercase tracking-tight placeholder:text-gray-200" />
          <button className="font-black uppercase tracking-widest text-sm hover:scale-110 transition-transform">Sign Up</button>
        </div>
      </section>
    </div>
  );
}
