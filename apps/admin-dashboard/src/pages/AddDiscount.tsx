import { useState, useEffect } from "react";
import { ArrowLeft, Tag, Percent, Gift, Users, Calendar, Sparkles, X, Loader2, Package, Check, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

type DiscountType = 'Coupon' | 'Role-based' | 'BOGO' | 'Automatic';

export default function AddDiscount() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    // Basic Info
    const [type, setType] = useState<DiscountType>('Coupon');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Active');

    // Discount Rules
    const [valueType, setValueType] = useState<'Percentage' | 'Fixed'>('Percentage');
    const [value, setValue] = useState('');
    const [minSpend, setMinSpend] = useState('');
    const [usageLimit, setUsageLimit] = useState('');

    // Targeting
    const [targetRole, setTargetRole] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    // Scheduling
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // BOGO Logic
    const [bogoBuyQty, setBogoBuyQty] = useState('1');
    const [bogoGetQty, setBogoGetQty] = useState('1');
    const [bogoDiscountType, setBogoDiscountType] = useState<'Free' | 'Percentage'>('Free');
    const [bogoDiscountValue, setBogoDiscountValue] = useState('');
    const [bogoBuyProductId, setBogoBuyProductId] = useState('');
    const [bogoGetProductId, setBogoGetProductId] = useState('');

    // Resources
    const [products, setProducts] = useState<{ id: string, name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [brands, setBrands] = useState<{ id: string, name: string }[]>([]);
    const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
            setCategories(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        });
        const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
            setBrands(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        });
        const unsubRoles = onSnapshot(collection(db, "customerRoles"), (snap) => {
            setRoles(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.id })));
        });
        const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
            setProducts(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        });

        if (id) {
            fetchDiscount(id);
        }

        return () => { unsubCats(); unsubBrands(); unsubRoles(); unsubProducts(); };
    }, [id]);

    const fetchDiscount = async (dId: string) => {
        setIsFetching(true);
        try {
            const docRef = doc(db, "discounts", dId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setType(data.type);
                setCode(data.code || '');
                setDescription(data.description || '');
                setStatus(data.status || 'Active');
                setValueType(data.valueType || 'Percentage');
                setValue(data.value?.toString() || '');
                setMinSpend(data.minSpend?.toString() || '');
                setUsageLimit(data.usageLimit?.toString() || '');
                setTargetRole(data.targetRole || '');
                setSelectedCategories(data.targetCategories || []);
                setSelectedBrands(data.targetBrands || []);
                setSelectedProducts(data.targetProducts || []);
                setStartDate(data.startDate || '');
                setEndDate(data.endDate || '');
                setBogoBuyQty(data.bogoBuyQty?.toString() || '1');
                setBogoGetQty(data.bogoGetQty?.toString() || '1');
                setBogoDiscountType(data.bogoDiscountType || 'Free');
                setBogoDiscountValue(data.bogoDiscountValue?.toString() || '');
                setBogoBuyProductId(data.bogoBuyProductId || '');
                setBogoGetProductId(data.bogoGetProductId || '');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async () => {
        if (!description || (type === 'Coupon' && !code)) {
            alert("Please fill in the required fields Strategy Description and Coupon Code (if applicable).");
            return;
        }

        setIsPublishing(true);
        try {
            const discountData = {
                type,
                code: type === 'Coupon' ? code.toUpperCase() : null,
                description,
                status,
                valueType,
                value: parseFloat(value) || 0,
                minSpend: parseFloat(minSpend) || 0,
                usageLimit: parseInt(usageLimit) || null,
                targetRole: type === 'Role-based' ? targetRole : null,
                targetCategories: selectedCategories,
                targetBrands: selectedBrands,
                targetProducts: selectedProducts,
                startDate,
                endDate,
                bogoBuyQty: type === 'BOGO' ? parseInt(bogoBuyQty) : null,
                bogoGetQty: type === 'BOGO' ? parseInt(bogoGetQty) : null,
                bogoDiscountType: type === 'BOGO' ? bogoDiscountType : null,
                bogoDiscountValue: type === 'BOGO' ? parseFloat(bogoDiscountValue) : null,
                bogoBuyProductId: type === 'BOGO' ? bogoBuyProductId : null,
                bogoGetProductId: type === 'BOGO' ? bogoGetProductId : null,
                updatedAt: serverTimestamp(),
            };

            if (id) {
                await updateDoc(doc(db, "discounts", id), discountData);
                alert("Promotion Strategy Updated!");
            } else {
                await addDoc(collection(db, "discounts"), {
                    ...discountData,
                    createdAt: serverTimestamp(),
                    usageCount: 0
                });
                alert("New Promotion Strategy Published!");
            }
            navigate('/discounts');
        } catch (error) {
            console.error(error);
            alert("Strategic Failure: Could not save promotion.");
        } finally {
            setIsPublishing(false);
        }
    };

    if (isFetching) {
        return (
            <div className="h-screen flex items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Retuning Strategy...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/discounts')}
                        className="w-12 h-12 rounded-2xl border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{id ? 'Refine Strategy' : 'Build Strategy'}</h1>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5 uppercase tracking-widest">Promotion & Discount Architect</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isPublishing}
                        className="bg-black text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {id ? 'Update Strategy' : 'Publish Strategy'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Strategy Type Selection */}
                    <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-sm space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Tag className="w-5 h-5" /> Promotion Architecture
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { id: 'Coupon', icon: Tag, label: 'Coupon' },
                                    { id: 'Role-based', icon: Users, label: 'Role Reward' },
                                    { id: 'BOGO', icon: Gift, label: 'BOGO Deal' },
                                    { id: 'Automatic', icon: Percent, label: 'Auto-Sale' },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id as DiscountType)}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group",
                                            type === t.id
                                                ? "border-black bg-black text-white shadow-xl shadow-black/10 scale-105"
                                                : "border-border bg-gray-50/50 text-muted-foreground hover:border-black/20 hover:bg-white"
                                        )}
                                    >
                                        <t.icon className={cn("w-6 h-6", type === t.id ? "text-white" : "group-hover:text-black")} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Strategy Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="e.g. Summer Clearance Event"
                                        className="w-full bg-gray-50/50 px-5 py-4 rounded-2xl border border-border outline-none font-semibold text-sm focus:bg-white focus:ring-4 ring-black/5 transition-all"
                                    />
                                </div>
                                {type === 'Coupon' && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Coupon Code</label>
                                        <input
                                            type="text"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="e.g. SUMMER50"
                                            className="w-full bg-black text-white px-5 py-4 rounded-2xl border-none outline-none font-black text-sm tracking-widest uppercase focus:ring-4 ring-black/10 transition-all placeholder:text-gray-500"
                                        />
                                    </motion.div>
                                )}
                                {type === 'Role-based' && (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Target Customer Role</label>
                                        <select
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                            className="w-full bg-gray-50/50 px-5 py-4 rounded-2xl border border-border outline-none font-semibold text-sm focus:bg-white focus:ring-4 ring-black/5 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Target Role</option>
                                            <option value="admin">Administrator</option>
                                            <option value="customer">Customer</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.name}>{r.name}</option>
                                            ))}
                                        </select>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Discount Rules */}
                    <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-sm space-y-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Percent className="w-5 h-5" /> Benefit Configuration
                        </h3>

                        {type !== 'BOGO' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Reward Type</label>
                                    <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                                        {['Percentage', 'Fixed'].map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => setValueType(v as any)}
                                                className={cn(
                                                    "flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                                    valueType === v ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-black"
                                                )}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-gray-50/50 px-5 py-4 rounded-2xl border border-border outline-none font-black text-2xl focus:bg-white focus:ring-4 ring-black/5 transition-all"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-xl text-muted-foreground/30">
                                            {valueType === 'Percentage' ? '%' : '$'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Minimum Spend ($)</label>
                                        <input
                                            type="number"
                                            value={minSpend}
                                            onChange={(e) => setMinSpend(e.target.value)}
                                            placeholder="No Minimum"
                                            className="w-full bg-gray-50/50 px-5 py-3 rounded-xl border border-border outline-none font-semibold text-sm focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Global Usage Limit</label>
                                        <input
                                            type="number"
                                            value={usageLimit}
                                            onChange={(e) => setUsageLimit(e.target.value)}
                                            placeholder="Unlimited"
                                            className="w-full bg-gray-50/50 px-5 py-3 rounded-xl border border-border outline-none font-semibold text-sm focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Buy Quantity</label>
                                        <input
                                            type="number"
                                            value={bogoBuyQty}
                                            onChange={(e) => setBogoBuyQty(e.target.value)}
                                            className="w-full bg-gray-50/50 px-5 py-4 rounded-2xl border border-border outline-none font-black text-xl focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Get Quantity</label>
                                        <input
                                            type="number"
                                            value={bogoGetQty}
                                            onChange={(e) => setBogoGetQty(e.target.value)}
                                            className="w-full bg-gray-50/50 px-5 py-4 rounded-2xl border border-border outline-none font-black text-xl focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-purple-700 tracking-[0.2em] mb-1">Benefit Type</p>
                                        <div className="flex gap-4 items-center mt-2">
                                            {['Free', 'Percentage'].map(bt => (
                                                <button
                                                    key={bt}
                                                    onClick={() => setBogoDiscountType(bt as any)}
                                                    className={cn(
                                                        "px-6 py-2 rounded-full text-[9px] font-bold uppercase transition-all",
                                                        bogoDiscountType === bt ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-white text-purple-400"
                                                    )}
                                                >
                                                    {bt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {bogoDiscountType === 'Percentage' && (
                                        <div className="w-40">
                                            <input
                                                type="number"
                                                value={bogoDiscountValue}
                                                onChange={(e) => setBogoDiscountValue(e.target.value)}
                                                placeholder="% Off"
                                                className="w-full bg-white px-4 py-3 rounded-xl border border-purple-200 outline-none font-black text-lg text-purple-700 placeholder:text-purple-200"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-purple-100">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-purple-700 ml-1">Condition: Buy Specific Product</label>
                                        <select
                                            value={bogoBuyProductId}
                                            onChange={(e) => setBogoBuyProductId(e.target.value)}
                                            className="w-full bg-white px-5 py-4 rounded-2xl border border-purple-100 outline-none font-semibold text-sm focus:ring-4 ring-purple-500/5 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Any Product (Default)</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-purple-700 ml-1">Reward: Get Specific Product</label>
                                        <select
                                            value={bogoGetProductId}
                                            onChange={(e) => setBogoGetProductId(e.target.value)}
                                            className="w-full bg-white px-5 py-4 rounded-2xl border border-purple-100 outline-none font-semibold text-sm focus:ring-4 ring-purple-500/5 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Same as Purchased (Default)</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Targeting */}
                    <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-sm space-y-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Package className="w-5 h-5" /> Targeting Restrictions
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Allowed Categories</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedCategories.map(cat => (
                                        <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[9px] font-bold uppercase rounded-lg">
                                            {cat}
                                            <button onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                                <select
                                    onChange={(e) => {
                                        if (e.target.value && !selectedCategories.includes(e.target.value)) {
                                            setSelectedCategories([...selectedCategories, e.target.value]);
                                        }
                                        e.target.value = "";
                                    }}
                                    className="w-full bg-gray-50/50 px-4 py-3 rounded-xl border border-border outline-none font-bold text-[10px] uppercase cursor-pointer"
                                >
                                    <option value="">Add Category...</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Allowed Brands</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedBrands.map(b => (
                                        <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[9px] font-bold uppercase rounded-lg">
                                            {b}
                                            <button onClick={() => setSelectedBrands(selectedBrands.filter(i => i !== b))}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                                <select
                                    onChange={(e) => {
                                        if (e.target.value && !selectedBrands.includes(e.target.value)) {
                                            setSelectedBrands([...selectedBrands, e.target.value]);
                                        }
                                        e.target.value = "";
                                    }}
                                    className="w-full bg-gray-50/50 px-4 py-3 rounded-xl border border-border outline-none font-bold text-[10px] uppercase cursor-pointer"
                                >
                                    <option value="">Add Brand...</option>
                                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Specific Product Targeting (Bulk Selection)</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedProducts.map(pId => {
                                    const productName = products.find(p => p.id === pId)?.name || pId;
                                    return (
                                        <span key={pId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold uppercase rounded-lg shadow-sm">
                                            {productName}
                                            <button onClick={() => setSelectedProducts(selectedProducts.filter(id => id !== pId))}><X className="w-3 h-3" /></button>
                                        </span>
                                    );
                                })}
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-black transition-colors" />
                                <select
                                    onChange={(e) => {
                                        if (e.target.value && !selectedProducts.includes(e.target.value)) {
                                            setSelectedProducts([...selectedProducts, e.target.value]);
                                        }
                                        e.target.value = "";
                                    }}
                                    className="w-full bg-gray-50/50 pl-11 pr-4 py-4 rounded-2xl border border-border outline-none font-bold text-[11px] uppercase cursor-pointer focus:bg-white transition-all appearance-none"
                                >
                                    <option value="">Quick Add Product to Strategy...</option>
                                    {products
                                        .filter(p => !selectedProducts.includes(p.id))
                                        .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <Sparkles className="w-3 h-3 text-blue-500" />
                                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">Strategy will only apply to these selected items.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Status & Scheduling */}
                <div className="space-y-6">
                    <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-border pb-4">Strategy Status</h4>
                        <div className="space-y-3">
                            {['Active', 'Paused', 'Expired'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                                        status === s ? "border-black bg-black text-white shadow-lg shadow-black/10" : "border-border bg-gray-50/50 text-muted-foreground hover:bg-white hover:text-black"
                                    )}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{s}</span>
                                    {status === s && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-sm space-y-6">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-border pb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Timeline
                        </h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-gray-50/50 px-4 py-3 rounded-xl border border-border outline-none font-bold text-[10px] uppercase appearance-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground ml-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-gray-50/50 px-4 py-3 rounded-xl border border-border outline-none font-bold text-[10px] uppercase appearance-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase text-blue-700 tracking-widest leading-relaxed">Advanced Strategy Mode</p>
                            <p className="text-[9px] text-blue-600/80 font-medium uppercase mt-1">Automatic conflict resolution active.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
