"use client";


import { User, Package, MapPin, CreditCard, Settings, LogOut, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function AccountPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            try {
                // Fetch Orders
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const orderData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().createdAt?.toDate().toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }) || "Recently"
                }));
                setOrders(orderData);

                // Fetch Addresses
                const userDocSnap = await getDocs(query(collection(db, `users/${user.uid}/addresses`)));
                const addressData = userDocSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAddresses(addressData);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        if (user) fetchUserData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-black" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Syncing Identity...</p>
            </div>
        );
    }

    if (!user) return null;

    const initials = user.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : "U";

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <main className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-3 space-y-8">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-black text-2xl">{initials}</div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">{user.displayName || "Elite Member"}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Member</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {[
                                { id: "profile", label: "Profile Details", icon: User },
                                { id: "orders", label: "My Orders", icon: Package },
                                { id: "addresses", label: "Addresses", icon: MapPin },
                                { id: "payment", label: "Payment Info", icon: CreditCard },
                                { id: "settings", label: "Security", icon: Settings },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-xl' : 'hover:bg-gray-50 text-gray-400'}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                            <button
                                onClick={() => logout()}
                                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-red-400 hover:bg-red-50 transition-all mt-8"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            {activeTab === "profile" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-12"
                                >
                                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Profile Details</h1>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Full Name</label>
                                            <div className="bg-gray-50 p-6 rounded-3xl font-bold">{user.displayName || "Not Set"}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Email Address</label>
                                            <div className="bg-gray-50 p-6 rounded-3xl font-bold">{user.email}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">User ID</label>
                                            <div className="bg-gray-50 p-6 rounded-3xl font-bold text-[10px]">{user.uid}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Status</label>
                                            <div className="bg-gray-50 p-6 rounded-3xl font-bold flex justify-between items-center text-[10px] uppercase tracking-widest">
                                                Verified Member
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="bg-black text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:shadow-2xl transition-shadow">
                                        Edit Profile
                                    </button>
                                </motion.div>
                            )}

                            {activeTab === "orders" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-12"
                                >
                                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Order History</h1>
                                    <div className="space-y-6">
                                        {orders.map(order => (
                                            <div key={order.id} className="border border-gray-100 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:border-black transition-colors">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{order.date}</p>
                                                    <h3 className="text-xl font-black uppercase tracking-tight">{order.id}</h3>
                                                </div>
                                                <div className="flex gap-12">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Status</p>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total</p>
                                                        <span className="text-xl font-black italic">{order.total}</span>
                                                    </div>
                                                </div>
                                                <button className="bg-gray-50 p-4 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                                                    <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === "addresses" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-12"
                                >
                                    <div className="flex justify-between items-center">
                                        <h1 className="text-5xl font-black uppercase tracking-tighter italic">Saved Addresses</h1>
                                        <button className="bg-black text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[9px] hover:shadow-xl transition-all">
                                            Add New Address
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {addresses.length > 0 ? addresses.map(addr => (
                                            <div key={addr.id} className="border border-gray-100 p-8 rounded-[2rem] space-y-4 hover:border-black transition-colors relative group">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-black uppercase tracking-tight">{addr.type || "Shipping Address"}</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{addr.isDefault ? "Primary" : "Secondary"}</p>
                                                    </div>
                                                    {addr.isDefault && <MapPin className="w-5 h-5 text-black" />}
                                                </div>
                                                <div className="text-sm font-medium text-gray-600 leading-relaxed">
                                                    {addr.line1}<br />
                                                    {addr.city}, {addr.state} {addr.zip}<br />
                                                    {addr.phone}
                                                </div>
                                                <div className="pt-4 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-[9px] font-black uppercase tracking-widest border-b border-black">Edit</button>
                                                    <button className="text-[9px] font-black uppercase tracking-widest text-red-500 border-b border-red-500">Delete</button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] flex flex-col items-center gap-4 text-center">
                                                <MapPin className="w-12 h-12 text-gray-200" />
                                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">No addresses on record.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "payment" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-12"
                                >
                                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Payment Methods</h1>
                                    <div className="py-20 bg-gray-50 rounded-[3rem] flex flex-col items-center gap-4 text-center">
                                        <CreditCard className="w-12 h-12 text-gray-200" />
                                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Secure Vault: No cards saved.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </main>
        </div>
    );
}
