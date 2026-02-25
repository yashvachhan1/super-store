import { useState, useEffect } from "react";
import { Plus, Search, Tag, Trash2, Edit3, Loader2, Percent, Gift, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface Discount {
    id: string;
    code?: string;
    type: 'Coupon' | 'Role-based' | 'BOGO' | 'Automatic';
    value: string;
    status: 'Active' | 'Paused' | 'Expired';
    targetRole?: string;
    description: string;
    usageCount?: number;
    usageLimit?: number;
    startDate?: any;
    endDate?: any;
}

export default function Discounts() {
    const navigate = useNavigate();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const q = query(collection(db, "discounts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Discount[];
            setDiscounts(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Deactivate this promotion permanently?")) return;
        try {
            await deleteDoc(doc(db, "discounts", id));
        } catch (error) {
            console.error(error);
        }
    };

    const getTypeIcon = (type: Discount['type']) => {
        switch (type) {
            case 'Coupon': return <Tag className="w-4 h-4" />;
            case 'Role-based': return <Users className="w-4 h-4" />;
            case 'BOGO': return <Gift className="w-4 h-4" />;
            default: return <Percent className="w-4 h-4" />;
        }
    };

    const filtered = discounts.filter(d =>
        d.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Discount Engine</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Configure coupons, role-based rewards, and automated promotions.</p>
                </div>
                <button
                    onClick={() => navigate('/discounts/add')}
                    className="bg-black text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Create Promotion
                </button>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 bg-white px-6 py-3 rounded-xl flex items-center gap-3 border border-border focus-within:ring-2 ring-black/5 transition-all shadow-sm">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search coupons or descriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-medium w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Optimizing Offers...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-32 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-border flex flex-col items-center justify-center text-center px-10">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 opacity-40">
                            <Tag className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">No active promotions</h4>
                        <p className="text-sm text-muted-foreground mb-8 max-w-sm">Start your first marketing campaign to drive sales and customer loyalty.</p>
                        <button
                            onClick={() => navigate('/discounts/add')}
                            className="text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-3 bg-white border border-border rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"
                        >
                            Build Strategy
                        </button>
                    </div>
                ) : (
                    filtered.map((discount, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={discount.id}
                            className="bg-white p-5 rounded-2xl border border-border flex items-center gap-6 group hover:shadow-md transition-all"
                        >
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all group-hover:scale-110",
                                discount.type === 'Coupon' ? "bg-orange-50 text-orange-600" :
                                    discount.type === 'Role-based' ? "bg-blue-50 text-blue-600" :
                                        discount.type === 'BOGO' ? "bg-purple-50 text-purple-600" : "bg-black text-white"
                            )}>
                                {getTypeIcon(discount.type)}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{discount.type}</span>
                                    <span className={cn(
                                        "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                                        discount.status === 'Active' ? "text-green-600 bg-green-50 border border-green-100" : "text-yellow-600 bg-yellow-50 border border-yellow-100"
                                    )}>
                                        {discount.status}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 leading-none mb-1.5">{discount.code || discount.description}</h3>
                                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-4">
                                    <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> {discount.value}</span>
                                    {discount.usageLimit && <span className="flex items-center gap-1 font-bold">{discount.usageCount || 0}/{discount.usageLimit} USES</span>}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/discounts/edit/${discount.id}`)}
                                    className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all bg-white shadow-sm"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(discount.id)}
                                    className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all bg-white shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
