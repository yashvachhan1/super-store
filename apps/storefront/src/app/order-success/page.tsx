"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight, Package, Truck, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full text-center space-y-12"
            >
                <div className="flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center shadow-2xl">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-6xl font-black uppercase tracking-tighter italic">Order Secured.</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">A confirmation email is flying your way.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-gray-100">
                    <div className="flex flex-col items-center gap-2">
                        <Package className="w-5 h-5 text-gray-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Processing</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Truck className="w-5 h-5 text-gray-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipped</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Arrives in 2-4 Days</span>
                    </div>
                </div>

                <div className="pt-8">
                    <Link href="/" className="group inline-flex items-center gap-4 bg-black text-white px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-all shadow-xl">
                        Continue Exploring
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="mt-20 p-8 bg-gray-50 rounded-[3rem]">
                    <p className="text-[9px] font-bold text-gray-400 leading-relaxed italic uppercase tracking-widest">
                        &quot;Your style is an extension of your soul. We are honored to handle your next evolution.&quot;
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
