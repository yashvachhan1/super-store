import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
    Search,
    Package,
    Calendar,
    CreditCard,
    Loader2,
    CheckCircle2,
    Clock,
    Truck,
    XCircle,
    Trash2,
    Eye
} from "lucide-react";

interface Order {
    id: string;
    orderId: string;
    customerEmail: string;
    items: any[];
    total: number;
    paymentMethod: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: any;
    address: any;
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredOrders = orders.filter(o =>
        o.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const updateStatus = async (id: string, newStatus: Order['status']) => {
        try {
            await updateDoc(doc(db, "orders", id), { status: newStatus });
        } catch (err) {
            console.error("Error updating order status:", err);
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (!confirm("Are you sure you want to delete this order?")) return;
        try {
            await deleteDoc(doc(db, "orders", id));
        } catch (err) {
            console.error("Error deleting order:", err);
        }
    };

    const getStatusStyles = (status: Order['status']) => {
        switch (status) {
            case 'Delivered': return "bg-green-500 text-white";
            case 'Pending': return "bg-orange-500 text-white";
            case 'Processing': return "bg-blue-500 text-white";
            case 'Shipped': return "bg-purple-500 text-white";
            case 'Cancelled': return "bg-red-500 text-white";
            default: return "bg-gray-500 text-white";
        }
    };

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'Delivered': return <CheckCircle2 className="w-3 h-3" />;
            case 'Pending': return <Clock className="w-3 h-3" />;
            case 'Processing': return <Loader2 className="w-3 h-3 animate-spin" />;
            case 'Shipped': return <Truck className="w-3 h-3" />;
            case 'Cancelled': return <XCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Track and manage your global customer fulfillment.</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex-1 flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full font-medium"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-border rounded-[2rem] shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-black" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Syncing Orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/30">
                        <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">No orders found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse border-spacing-0">
                        <thead>
                            <tr className="border-b border-border bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Identity</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, i) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    key={order.id}
                                    className="group hover:bg-muted/30 transition-colors border-b border-border last:border-none"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900 leading-none mb-1">{order.orderId}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">{order.customerEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm text-gray-900">${order.total.toFixed(2)}</p>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{order.items.length} Items</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{order.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {order.createdAt?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Feb 24, 2026'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative group/status inline-block">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyles(order.status)} shadow-sm`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>

                                            {/* Status Quick Switch */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-2xl border border-border p-1.5 z-[100] invisible group-hover/status:visible scale-95 opacity-0 group-hover/status:scale-100 group-hover/status:opacity-100 transition-all min-w-[140px]">
                                                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => updateStatus(order.id, s as Order['status'])}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-muted transition-colors flex items-center gap-2
                                                            ${order.status === s ? 'text-black bg-muted' : 'text-gray-400'}`}
                                                    >
                                                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusStyles(s as Order['status'])}`} />
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors border border-transparent text-muted-foreground"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="p-2 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
