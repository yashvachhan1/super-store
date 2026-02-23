import { useState, useEffect } from "react";
import { Plus, ArrowLeft, Image as ImageIcon, Sparkles, Wand2, X, Box, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Attribute {
    id: string;
    name: string;
    values: string[];
}

interface Variant {
    id: string;
    combination: Record<string, string>;
    price: number;
    stock: number;
    sku: string;
    image?: string;
}

export default function AddProduct() {
    const navigate = useNavigate();
    const [productType, setProductType] = useState<'simple' | 'variable'>('simple');
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [sku, setSku] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    // Taxonomies State
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
            setCategories(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        });
        const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
            setBrands(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        });
        return () => { unsubCats(); unsubBrands(); };
    }, []);

    const handlePublish = async () => {
        if (!name || (!price && productType === 'simple') || !category) {
            alert("Please fill in basic product details.");
            return;
        }

        setIsPublishing(true);
        try {
            const productData = {
                name,
                price: Number(price) || 0,
                stock: Number(stock) || 0,
                sku,
                description,
                shortDescription,
                images,
                category,
                brand,
                type: productType,
                createdAt: serverTimestamp(),
                attributes: productType === 'variable' ? attributes : [],
                variants: productType === 'variable' ? variants : []
            };

            await addDoc(collection(db, "products"), productData);
            setIsPublishing(false);
            alert('Product DNA Synthesized Successfully!');
            navigate('/products');
        } catch (error) {
            console.error("Error publishing product:", error);
            alert("Failed to synthesize product.");
            setIsPublishing(false);
        }
    };

    const handleMainImageAdd = () => {
        const url = prompt('Enter Image URL (Demo):');
        if (url) setImages([...images, url]);
    };

    const handleVariantImageAdd = (vId: string) => {
        const url = prompt('Enter Variant Image URL (Demo):');
        if (url) updateVariant(vId, 'image', url);
    };

    const removeImage = (idx: number) => {
        setImages(images.filter((_, i) => i !== idx));
    };

    const addAttribute = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setAttributes([...attributes, { id, name: '', values: [] }]);
    };

    const removeAttribute = (id: string) => {
        setAttributes(attributes.filter(a => a.id !== id));
    };

    const updateAttributeName = (id: string, name: string) => {
        setAttributes(attributes.map(a => a.id === id ? { ...a, name } : a));
    };

    const addAttributeValue = (id: string, inputValue: string) => {
        if (!inputValue.trim()) return;

        // Split by space, comma, or pipe
        const newValues = inputValue.split(/[ ,|]+/)
            .map(v => v.trim())
            .filter(v => v !== "");

        setAttributes(attributes.map(a => {
            if (a.id === id) {
                const combined = [...a.values];
                newValues.forEach(nv => {
                    if (!combined.includes(nv)) combined.push(nv);
                });
                return { ...a, values: combined };
            }
            return a;
        }));
    };

    const removeAttributeValue = (attrId: string, valIndex: number) => {
        setAttributes(attributes.map(a => {
            if (a.id === attrId) {
                const newValues = [...a.values];
                newValues.splice(valIndex, 1);
                return { ...a, values: newValues };
            }
            return a;
        }));
    };

    const generateVariants = () => {
        if (attributes.length === 0) return;

        // Cartesian product of attribute values
        const validAttributes = attributes.filter(a => a.values.length > 0);
        if (validAttributes.length === 0) return;

        const combinations = validAttributes.reduce((acc, attr) => {
            if (acc.length === 0) return attr.values.map(v => ({ [attr.name || 'Attr']: v }));

            const nextAcc: any[] = [];
            acc.forEach(existingCombo => {
                attr.values.forEach(val => {
                    nextAcc.push({ ...existingCombo, [attr.name || 'Attr']: val });
                });
            });
            return nextAcc;
        }, [] as any[]);

        const newVariants: Variant[] = combinations.map((combo, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            combination: combo,
            price: Number(price) || 0,
            stock: Number(stock) || 0,
            sku: `${name.substring(0, 3).toUpperCase()}-${Object.values(combo).join('-').toUpperCase()}-${i}`
        }));

        setVariants(newVariants);
    };

    const [expandedVariants, setExpandedVariants] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState('');

    const toggleVariant = (id: string) => {
        setExpandedVariants(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    const applyBulkAction = () => {
        if (!bulkAction) return;

        if (bulkAction === 'Set Regular Prices') {
            const p = prompt('Enter price for all variations:');
            if (p) setVariants(variants.map(v => ({ ...v, price: Number(p) })));
        } else if (bulkAction === 'Set Stock Quantity') {
            const s = prompt('Enter stock for all variations:');
            if (s) setVariants(variants.map(v => ({ ...v, stock: Number(s) })));
        } else if (bulkAction === 'Delete All Variations') {
            if (confirm('Delete all variations?')) setVariants([]);
        }
        setBulkAction('');
    };

    const updateVariant = (id: string, field: keyof Variant, value: any) => {
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/products')}
                        className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Add Product</h1>
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">Creation Protocol Initialized</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] border border-border hover:bg-muted transition-all disabled:opacity-50" disabled={isPublishing}>Save Draft</button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] bg-black text-white hover:shadow-2xl transition-all disabled:bg-muted-foreground relative overflow-hidden"
                    >
                        {isPublishing ? (
                            <motion.div
                                initial={{ y: 20 }}
                                animate={{ y: 0 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                Publishing...
                            </motion.div>
                        ) : (
                            "Publish Product"
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Core Details Gear */}
                    <div className="glass p-10 rounded-[3rem] space-y-8">
                        <h3 className="text-xl font-black uppercase tracking-tighter italic border-b border-border pb-6 flex items-center gap-3">
                            <Sparkles className="w-5 h-5" /> Product DNA
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. ULTRA BOOST 1.0 'CORE BLACK'"
                                    className="w-full bg-muted/30 px-8 py-5 rounded-[2rem] border-none outline-none font-black italic tracking-tighter text-xl focus:bg-white focus:ring-2 ring-black transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price ($)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold uppercase tracking-widest text-xs focus:bg-white focus:ring-2 ring-black transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Stock</label>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold uppercase tracking-widest text-xs focus:bg-white focus:ring-2 ring-black transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 mt-6 border-t border-border/50">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Short Description</label>
                                    <textarea
                                        value={shortDescription}
                                        onChange={(e) => setShortDescription(e.target.value)}
                                        placeholder="Brief summary of the product..."
                                        rows={3}
                                        className="w-full bg-muted/30 px-8 py-5 rounded-[2rem] border-none outline-none font-medium text-sm focus:bg-white focus:ring-2 ring-black transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write detailed product story, specs, and features..."
                                        rows={8}
                                        className="w-full bg-muted/30 px-8 py-6 rounded-[2.5rem] border-none outline-none font-medium text-sm focus:bg-white focus:ring-2 ring-black transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Gallery */}
                    <div className="glass p-10 rounded-[3rem] space-y-8">
                        <h3 className="text-xl font-black uppercase tracking-tighter italic border-b border-border pb-6 flex items-center gap-3">
                            <ImageIcon className="w-5 h-5" /> Media Arsenal
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-3xl overflow-hidden border border-border group relative">
                                    <img src={img} className="w-full h-full object-cover" alt="Product" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={handleMainImageAdd}
                                className="col-span-1 aspect-square border-2 border-dashed border-muted rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-black cursor-pointer group transition-all"
                            >
                                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Add Visual</p>
                            </button>
                        </div>
                    </div>

                    {/* Variable Product Logic */}
                    <div className="glass p-10 rounded-[3rem] space-y-8">
                        <div className="flex justify-between items-center border-b border-border pb-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                                <Wand2 className="w-5 h-5" /> Variants & Logic
                            </h3>
                            <div className="bg-muted/50 p-1.5 rounded-full flex gap-1">
                                <button
                                    onClick={() => setProductType('simple')}
                                    className={cn(
                                        "px-8 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                        productType === 'simple' ? "bg-black text-white shadow-lg" : "text-muted-foreground hover:text-black"
                                    )}
                                >Simple</button>
                                <button
                                    onClick={() => setProductType('variable')}
                                    className={cn(
                                        "px-8 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                        productType === 'variable' ? "bg-black text-white shadow-lg" : "text-muted-foreground hover:text-black"
                                    )}
                                >Variable</button>
                            </div>
                        </div>

                        {productType === 'variable' && (
                            <div className="space-y-10">
                                {/* Attribute Builder */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[11px] font-black uppercase tracking-widest italic">1. Define Attributes</p>
                                        <button
                                            onClick={addAttribute}
                                            className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-black transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Add Attribute
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {attributes.map((attr) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={attr.id}
                                                className="bg-muted/20 p-6 rounded-[2rem] relative group"
                                            >
                                                <button
                                                    onClick={() => removeAttribute(attr.id)}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-border rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <div className="grid grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Attr Name</label>
                                                        <input
                                                            type="text"
                                                            value={attr.name}
                                                            onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                                                            placeholder="e.g. Color"
                                                            className="w-full bg-white px-4 py-3 rounded-xl border border-border outline-none font-bold uppercase tracking-widest text-[10px] focus:ring-2 ring-black transition-all mt-1"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Values (Enter to add)</label>
                                                        <div className="mt-1 flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl border border-border min-h-[46px]">
                                                            {attr.values.map((val, idx) => (
                                                                <span key={idx} className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                                    {val}
                                                                    <X onClick={() => removeAttributeValue(attr.id, idx)} className="w-3 h-3 cursor-pointer hover:text-red-400" />
                                                                </span>
                                                            ))}
                                                            <input
                                                                type="text"
                                                                placeholder="Type & Enter"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        addAttributeValue(attr.id, (e.target as HTMLInputElement).value);
                                                                        (e.target as HTMLInputElement).value = '';
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    addAttributeValue(attr.id, e.target.value);
                                                                    e.target.value = '';
                                                                }}
                                                                className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest px-2"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {attributes.length > 0 && (
                                        <button
                                            onClick={generateVariants}
                                            className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                                        >
                                            <Sparkles className="w-4 h-4" /> Generate All Variations
                                        </button>
                                    )}
                                </div>

                                {/* Variants Grid (WP Style) */}
                                {variants.length > 0 && (
                                    <div className="space-y-8 pt-10 border-t border-border">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[11px] font-black uppercase tracking-widest italic text-black">2. Configure Variations ({variants.length})</p>

                                            {/* Bulk Actions Like WP */}
                                            <div className="flex gap-2">
                                                <select
                                                    value={bulkAction}
                                                    onChange={(e) => setBulkAction(e.target.value)}
                                                    className="bg-muted px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest outline-none border-none"
                                                >
                                                    <option value="">Bulk Actions</option>
                                                    <option value="Set Regular Prices">Set Regular Prices</option>
                                                    <option value="Set Stock Quantity">Set Stock Quantity</option>
                                                    <option value="Delete All Variations">Delete All Variations</option>
                                                </select>
                                                <button
                                                    onClick={applyBulkAction}
                                                    className="bg-black text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                                                >Go</button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {variants.map((variant, vIdx) => {
                                                const isExpanded = expandedVariants.includes(variant.id);
                                                return (
                                                    <motion.div
                                                        key={variant.id}
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: vIdx * 0.05 }}
                                                        className="bg-white border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all"
                                                    >
                                                        {/* Row Header (Collapsed State) */}
                                                        <div
                                                            onClick={() => toggleVariant(variant.id)}
                                                            className="bg-muted/30 p-6 flex justify-between items-center cursor-pointer group hover:bg-muted/50 transition-all"
                                                        >
                                                            <div className="flex gap-6 items-center">
                                                                <div className="w-14 h-14 bg-white rounded-2xl border border-border flex items-center justify-center shadow-inner overflow-hidden">
                                                                    {variant.image ? (
                                                                        <img src={variant.image} className="w-full h-full object-cover" alt="Variant" />
                                                                    ) : (
                                                                        <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex gap-2 items-center">
                                                                        {Object.entries(variant.combination).map(([k, v]) => (
                                                                            <span key={k} className="bg-black text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">{v}</span>
                                                                        ))}
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-muted-foreground mt-1.5 uppercase tracking-widest">SKU: {variant.sku || 'UNASSIGNED'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-10 items-center">
                                                                <div className="text-right">
                                                                    <p className="text-[9px] font-black text-muted-foreground uppercase">Price</p>
                                                                    <p className="text-sm font-black italic tracking-tighter">${variant.price || '0.00'}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[9px] font-black text-muted-foreground uppercase">Stock</p>
                                                                    <p className="text-sm font-black italic tracking-tighter text-green-600">{variant.stock || '0'}</p>
                                                                </div>
                                                                <div className={cn(
                                                                    "w-10 h-10 rounded-full flex items-center justify-center bg-white border border-border group-hover:bg-black group-hover:text-white transition-all",
                                                                    isExpanded && "bg-black text-white rotate-180"
                                                                )}>
                                                                    <ChevronDown className="w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Row Content (Detailed WP Form) */}
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="p-10 border-t border-border/50 bg-white grid grid-cols-3 gap-10">
                                                                        {/* Left: Media */}
                                                                        <div className="space-y-4">
                                                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Variant visual</label>
                                                                            <div
                                                                                onClick={() => handleVariantImageAdd(variant.id)}
                                                                                className="aspect-square bg-muted/20 border-2 border-dashed border-muted rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-black cursor-pointer group transition-all p-6 overflow-hidden relative"
                                                                            >
                                                                                {variant.image ? (
                                                                                    <>
                                                                                        <img src={variant.image} className="absolute inset-0 w-full h-full object-cover" alt="Variant" />
                                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[8px] font-black uppercase">Change Image</div>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                                                            <Plus className="w-5 h-5" />
                                                                                        </div>
                                                                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground text-center">Add unique<br />image</p>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Center/Right: Details */}
                                                                        <div className="col-span-2 grid grid-cols-2 gap-8">
                                                                            <div className="space-y-4">
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">SKU</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={variant.sku}
                                                                                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                                                        className="w-full bg-muted/30 px-6 py-3 rounded-2xl border-none outline-none font-bold text-[10px] uppercase tracking-widest focus:bg-white focus:ring-1 ring-black transition-all"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Regular Price ($)</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={variant.price}
                                                                                        onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                                                                                        className="w-full bg-muted/30 px-6 py-3 rounded-2xl border-none outline-none font-bold text-[10px] uppercase tracking-widest focus:bg-white focus:ring-1 ring-black transition-all"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-4">
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stock Quantity</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={variant.stock}
                                                                                        onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                                                                                        className="w-full bg-muted/30 px-6 py-3 rounded-2xl border-none outline-none font-bold text-[10px] uppercase tracking-widest focus:bg-white focus:ring-1 ring-black transition-all"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Inventory Status</label>
                                                                                    <select className="w-full bg-muted/30 px-6 py-3 rounded-2xl border-none outline-none font-bold text-[10px] uppercase tracking-widest appearance-none focus:bg-white focus:ring-1 ring-black transition-all">
                                                                                        <option>In Stock</option>
                                                                                        <option>Out of Stock</option>
                                                                                        <option>On Backorder</option>
                                                                                    </select>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {productType === 'simple' && (
                            <div className="space-y-10 pt-10 border-t border-border">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SKU</label>
                                        <input
                                            type="text"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            placeholder="e.g. U-BOOST-001"
                                            className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold uppercase tracking-widest text-xs focus:bg-white focus:ring-2 ring-black transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Inventory Status</label>
                                        <select className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold uppercase tracking-widest text-xs appearance-none focus:bg-white focus:ring-2 ring-black transition-all">
                                            <option>In Stock</option>
                                            <option>Out of Stock</option>
                                            <option>On Backorder</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="py-10 text-center text-muted-foreground border-t border-border/50 space-y-4 rounded-[2rem] bg-muted/5">
                                    <Box className="w-10 h-10 mx-auto opacity-10" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Pricing & Stock are managed in the Product DNA section for simple products.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Taxonomy / Meta */}
                <div className="space-y-8">
                    <div className="glass p-8 rounded-[2.5rem] space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-border pb-4">Taxonomy</h4>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Main Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-muted/30 px-6 py-4 rounded-xl border-none outline-none font-bold uppercase tracking-widest text-[9px] appearance-none transition-all cursor-pointer focus:bg-white focus:ring-1 ring-black"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Brand Affiliate</label>
                                <select
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="w-full bg-muted/30 px-6 py-4 rounded-xl border-none outline-none font-bold uppercase tracking-widest text-[9px] appearance-none transition-all cursor-pointer focus:bg-white focus:ring-1 ring-black"
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-border pb-4">Visibility Engine</h4>
                        <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-[2rem] border border-green-500/10">
                            <div>
                                <p className="text-[10px] font-black uppercase">Live on Storefront</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase">Visible to customers</p>
                            </div>
                            <div className="w-12 h-6 bg-black rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
