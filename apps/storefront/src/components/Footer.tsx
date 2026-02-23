"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-50 text-gray-500 py-16 px-8 flex flex-col md:flex-row justify-between items-center text-xs border-t border-gray-100">
            <div className="mb-6 md:mb-0 flex items-center gap-8">
                <div className="text-xl font-black tracking-tighter text-black uppercase">SS.</div>
                <span>&copy; 2026 SUPER STORE. <br className="md:hidden" /> Crafted for the Modern.</span>
            </div>

            <div className="flex gap-12 uppercase tracking-[0.2em] font-bold">
                <div className="flex flex-col gap-3">
                    <span className="text-black mb-2">Social</span>
                    <a href="#" className="hover:text-black transition-colors">Instagram</a>
                    <a href="#" className="hover:text-black transition-colors">TikTok</a>
                    <a href="#" className="hover:text-black transition-colors">Twitter</a>
                </div>
                <div className="flex flex-col gap-3">
                    <span className="text-black mb-2">Legal</span>
                    <a href="#" className="hover:text-black transition-colors">Privacy</a>
                    <a href="#" className="hover:text-black transition-colors">Terms</a>
                    <a href="#" className="hover:text-black transition-colors">Cookies</a>
                </div>
            </div>
        </footer>
    );
}
