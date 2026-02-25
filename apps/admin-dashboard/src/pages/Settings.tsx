import { useState, useEffect } from "react";
import {
    Store, Globe, DollarSign, Hash, Save,
    Loader2, Sparkles, ShieldCheck, Search,
    Users, Truck, Percent, Bell, ChevronRight, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface GlobalSettings {
    storeName: string;
    contactEmail: string;
    supportPhone: string;
    currencyCode: string;
    currencySymbol: string;
    timezone: string;
    orderPrefix: string;
    logoUrl: string;
}

const SETTINGS_CATEGORIES = [
    {
        id: 'general',
        label: 'General',
        description: 'View and update your store details and identity.',
        icon: Store,
        color: 'bg-blue-500',
        textColor: 'text-blue-600'
    },
    {
        id: 'payments',
        label: 'Payments',
        description: 'Configure payment methods and currency settings.',
        icon: DollarSign,
        color: 'bg-green-500',
        textColor: 'text-green-600'
    },
    {
        id: 'shipping',
        label: 'Shipping',
        description: 'Manage shipping rates, zones, and delivery providers.',
        icon: Truck,
        color: 'bg-orange-500',
        textColor: 'text-orange-600'
    },
    {
        id: 'taxes',
        label: 'Taxes',
        description: 'Manage how your store charges taxes and duties.',
        icon: Percent,
        color: 'bg-purple-500',
        textColor: 'text-purple-600'
    },
    {
        id: 'checkout',
        label: 'Checkout',
        description: 'Customize your online store checkout process.',
        icon: Save,
        color: 'bg-pink-500',
        textColor: 'text-pink-600'
    },
    {
        id: 'users',
        label: 'Users & Permissions',
        description: 'Manage staff accounts and permissions levels.',
        icon: Users,
        color: 'bg-indigo-500',
        textColor: 'text-indigo-600'
    },
    {
        id: 'domains',
        label: 'Domains',
        description: 'Connect and manage your custom web domains.',
        icon: Globe,
        color: 'bg-cyan-500',
        textColor: 'text-cyan-600'
    },
    {
        id: 'notifications',
        label: 'Notifications',
        description: 'Configure email and SMS alerts for customers.',
        icon: Bell,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600'
    },
];

export default function Settings() {
    const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
    const [activeCategory, setActiveCategory] = useState('general');

    const [settings, setSettings] = useState<GlobalSettings>({
        storeName: "Super Store",
        contactEmail: "admin@superstore.com",
        supportPhone: "+91 00000 00000",
        currencyCode: "INR",
        currencySymbol: "₹",
        timezone: "Asia/Kolkata",
        orderPrefix: "#SHOP-",
        logoUrl: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "settings", "global"), (snap) => {
            if (snap.exists()) {
                setSettings(snap.data() as GlobalSettings);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "global"), {
                ...settings,
                updatedAt: serverTimestamp()
            }, { merge: true });
            alert("Settings Synchronized!");
        } catch (error) {
            console.error(error);
            alert("Error: Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-5">
                <Loader2 className="w-10 h-10 animate-spin text-black" />
                <p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">Initializing System Configuration...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <AnimatePresence mode="wait">
                {view === 'dashboard' ? (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-12"
                    >
                        {/* Dashboard Header */}
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">Control Center</h1>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.4em] mt-2 flex items-center gap-3">
                                <Sparkles className="w-3.5 h-3.5 text-black" /> Mastering Store Operations
                            </p>
                        </div>


                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {SETTINGS_CATEGORIES.map((cat, idx) => {
                                const Icon = cat.icon;
                                return (
                                    <motion.button
                                        key={cat.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            setView('detail');
                                        }}
                                        className="group bg-white border border-border p-8 rounded-[2.5rem] text-left hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all relative overflow-hidden flex flex-col h-full"
                                    >
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:rotate-3", cat.color)}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 mb-2">{cat.label}</h3>
                                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed flex-1">
                                            {cat.description}
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/20 group-hover:text-black transition-colors">
                                            Manage Sector <ChevronRight className="w-3 h-3" />
                                        </div>

                                        {/* Subtle Background Icon */}
                                        <Icon className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-10"
                    >
                        {/* Detail Header */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setView('dashboard')}
                                className="group flex items-center gap-3 text-muted-foreground hover:text-black transition-colors"
                            >
                                <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center group-hover:border-black transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
                            </button>

                            <div className="flex gap-4">
                                {activeCategory === 'general' && (
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center", SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.color)}>
                                {(() => {
                                    const Icon = SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.icon || Store;
                                    return <Icon className="w-8 h-8 text-white" />;
                                })()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase italic">
                                    {SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.label}
                                </h1>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">
                                    Configuring Sector Parameters
                                </p>
                            </div>
                        </div>

                        {/* Content Area */}
                        {activeCategory === 'general' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section className="bg-white border border-border p-10 rounded-[3rem] shadow-sm space-y-10 md:col-span-2">
                                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                            <Store className="w-5 h-5" />
                                        </div>
                                        Core Identity
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Store Legal Name</label>
                                            <input
                                                type="text"
                                                value={settings.storeName}
                                                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                                                className="w-full bg-gray-50/50 px-6 py-5 rounded-2xl border-2 border-transparent outline-none font-bold text-base focus:bg-white focus:border-black transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Master Contact Email</label>
                                            <input
                                                type="email"
                                                value={settings.contactEmail}
                                                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                                className="w-full bg-gray-50/50 px-6 py-5 rounded-2xl border-2 border-transparent outline-none font-bold text-base focus:bg-white focus:border-black transition-all"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white border border-border p-10 rounded-[3rem] shadow-sm space-y-8">
                                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 text-orange-600">
                                        <Globe className="w-5 h-5" /> Regional Matrix
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Main Currency</label>
                                            <select
                                                value={settings.currencyCode}
                                                onChange={(e) => setSettings({ ...settings, currencyCode: e.target.value })}
                                                className="w-full bg-gray-50/50 px-6 py-4 rounded-2xl border-none outline-none font-bold text-sm cursor-pointer"
                                            >
                                                <option value="INR">Indian Rupee (₹)</option>
                                                <option value="USD">US Dollar ($)</option>
                                                <option value="EUR">Euro (€)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Operational Timezone</label>
                                            <select
                                                value={settings.timezone}
                                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                                className="w-full bg-gray-50/50 px-6 py-4 rounded-2xl border-none outline-none font-bold text-sm cursor-pointer"
                                            >
                                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                                <option value="UTC">UTC Standard</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white border border-border p-10 rounded-[3rem] shadow-sm space-y-8">
                                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 text-purple-600">
                                        <Hash className="w-5 h-5" /> Transaction Intel
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Order ID Signature</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={settings.orderPrefix}
                                                onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                                                className="max-w-[120px] bg-black text-white px-5 py-4 rounded-2xl outline-none font-black text-center text-sm"
                                            />
                                            <div className="flex-1 bg-gray-50 border border-border border-dashed rounded-2xl flex items-center justify-center px-4">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Preview: <span className="text-black">{settings.orderPrefix}1001</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="bg-white border border-border border-dashed p-20 rounded-[4rem] text-center space-y-8">
                                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-gray-200">
                                    <ShieldCheck className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Access Restricted</h2>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                                        This sector is awaiting synchronization with the core cluster. Phase 2 deployment will unlock this interface.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setView('dashboard')}
                                    className="px-10 py-4 bg-gray-50 hover:bg-black hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Return to Control Hub
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
