import { useState, useEffect } from "react";
import { Plus, ArrowLeft, Image as ImageIcon, Sparkles, Wand2, X, Box, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { collection, onSnapshot, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
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
    const { id } = useParams();
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
    const [isMatrixSwapped, setIsMatrixSwapped] = useState(false);
    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingVariantId, setUploadingVariantId] = useState<string | null>(null);

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

<<<<<<< Updated upstream
        if (id) {
            getDoc(doc(db, "products", id)).then(snap => {
                if (snap.exists()) {
                    const data = snap.data();
                    setName(data.name || '');
                    setProductType(data.type || 'simple');
                    setPrice(String(data.price || ''));
                    setStock(String(data.stock || ''));
                    setSku(data.sku || '');
                    setDescription(data.description || '');
                    setShortDescription(data.shortDescription || '');
                    setImages(data.images || []);
                    setCategory(data.category || '');
                    setBrand(data.brand || '');
                    setAttributes(data.attributes || []);
                    setVariants(data.variants || []);
                    setIsMatrixSwapped(data.isMatrixSwapped || false);
                }
            });
=======
        // Fetch product if in edit mode
        if (id) {
            const fetchProduct = async () => {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || "");
                    setPrice(data.price?.toString() || "");
                    setStock(data.stock?.toString() || "");
                    setSku(data.sku || "");
                    setDescription(data.description || "");
                    setShortDescription(data.shortDescription || "");
                    setImages(data.images || []);
                    setCategory(data.category || "");
                    setBrand(data.brand || "");
                    setProductType(data.type || "simple");
                    setAttributes(data.attributes || []);
                    setVariants(data.variants || []);
                }
            };
            fetchProduct();
>>>>>>> Stashed changes
        }

        return () => { unsubCats(); unsubBrands(); };
    }, [id]);

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
                isMatrixSwapped,
                createdAt: serverTimestamp(),
                attributes: productType === 'variable' ? attributes : [],
                variants: productType === 'variable' ? variants : []
            };

            if (id) {
                await updateDoc(doc(db, "products", id), productData);
                alert('Product DNA Updated Successfully!');
            } else {
<<<<<<< Updated upstream
                await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: serverTimestamp()
                });
=======
                await addDoc(collection(db, "products"), productData);
>>>>>>> Stashed changes
                alert('Product DNA Synthesized Successfully!');
            }
            setIsPublishing(false);
            navigate('/products');
        } catch (error) {
            console.error("Error publishing product:", error);
            alert("Failed to save product.");
            setIsPublishing(false);
        }
    };

    const handleFileUpload = async (file: File, onProgress: (loading: boolean) => void) => {
        onProgress(true);
        try {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error("Conversion error:", error);
            alert("Failed to process image.");
            return null;
        } finally {
            onProgress(false);
        }
    };

    const handleMainImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const base64 = await handleFileUpload(file, setUploadingMain);
        if (base64) setImages([...images, base64]);
    };

    const handleVariantImageAdd = async (vId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const base64 = await handleFileUpload(file, (loading) => setUploadingVariantId(loading ? vId : null));
        if (base64) updateVariant(vId, 'image', base64);
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

    const [isMatrixView, setIsMatrixView] = useState(false);

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

    const matrixData = (() => {
        if (variants.length === 0 || attributes.length === 0) return null;

        let rowAttr, colAttr;
        let rowValues, colValues;

        if (isMatrixSwapped) {
            rowAttr = attributes[1]?.name || attributes[0].name;
            colAttr = attributes[1] ? attributes[0].name : 'Default';
            rowValues = attributes[1]?.values || attributes[0].values;
            colValues = attributes[1] ? attributes[0].values : ['Default'];
        } else {
            rowAttr = attributes[0].name || 'Attr 1';
            colAttr = attributes[1]?.name || 'Default';
            rowValues = attributes[0].values;
            colValues = attributes[1]?.values || ['Default'];
        }

        const grid: Record<string, Record<string, Variant>> = {};
        variants.forEach(v => {
            const r = v.combination[rowAttr];
            const c = colAttr === 'Default' ? 'Default' : v.combination[colAttr];
            if (!grid[r]) grid[r] = {};
            grid[r][c] = v;
        });

        return { rowAttr, colAttr, rowValues, colValues, grid };
    })();

    const updateVariant = (id: string, field: keyof Variant, value: any) => {
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/products')}
                        className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add Product</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Fill in the details to list a new product in your store.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-border hover:bg-muted transition-all disabled:opacity-50" disabled={isPublishing}>Save Draft</button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-black text-white hover:shadow-lg transition-all disabled:bg-muted-foreground relative overflow-hidden"
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
                <div className="lg:col-span-2 space-y-6">
                    {/* Core Details */}
                    <div className="bg-white border border-border p-8 rounded-[2rem] shadow-sm space-y-8">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-border pb-4 flex items-center gap-2">
                            <Box className="w-5 h-5" /> Product Information
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Product Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Ultra Boost 1.0 'Core Black'"
                                    className="w-full bg-gray-50/50 px-6 py-3 rounded-xl border border-border outline-none font-semibold text-lg focus:bg-white focus:ring-2 ring-black/5 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Price ($)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-gray-50/50 px-5 py-3 rounded-xl border border-border outline-none font-semibold text-sm focus:bg-white focus:ring-2 ring-black/5 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Initial Stock</label>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-gray-50/50 px-5 py-3 rounded-xl border border-border outline-none font-semibold text-sm focus:bg-white focus:ring-2 ring-black/5 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-5 pt-8 mt-8 border-t border-border">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Short Description</label>
                                    <textarea
                                        value={shortDescription}
                                        onChange={(e) => setShortDescription(e.target.value)}
                                        placeholder="Brief summary of the product..."
                                        rows={2}
                                        className="w-full bg-gray-50/50 px-6 py-4 rounded-xl border border-border outline-none font-medium text-sm focus:bg-white focus:ring-2 ring-black/5 transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write detailed product story, specs, and features..."
                                        rows={6}
                                        className="w-full bg-gray-50/50 px-6 py-4 rounded-xl border border-border outline-none font-medium text-sm focus:bg-white focus:ring-2 ring-black/5 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Gallery */}
                    <div className="bg-white border border-border p-8 rounded-[2rem] shadow-sm space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-border pb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" /> Media Gallery
                        </h3>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-border group relative">
                                    <img src={img} className="w-full h-full object-cover" alt="Product" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-black/80 backdrop-blur-sm text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
<<<<<<< Updated upstream
                            <label className="col-span-1 aspect-square border-2 border-dashed border-muted rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-black cursor-pointer group transition-all relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleMainImageAdd}
                                />
                                {uploadingMain ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                                ) : (
                                    <>
                                        <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Add Visual</p>
                                    </>
                                )}
                            </label>
=======
                            <button
                                onClick={handleMainImageAdd}
                                className="col-span-1 aspect-square border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-gray-50/50 cursor-pointer group transition-all"
                            >
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-black">Add Media</p>
                            </button>
>>>>>>> Stashed changes
                        </div>
                    </div>

                    {/* Variable Product Logic */}
                    <div className="bg-white border border-border p-8 rounded-[2rem] shadow-sm space-y-8">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Wand2 className="w-5 h-5" /> Product Variants
                            </h3>
                            <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                                <button
                                    onClick={() => setProductType('simple')}
                                    className={cn(
                                        "px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                        productType === 'simple' ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-black"
                                    )}
                                >Simple</button>
                                <button
                                    onClick={() => setProductType('variable')}
                                    className={cn(
                                        "px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                        productType === 'variable' ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-black"
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
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={attr.id}
                                                className="bg-gray-50/50 border border-border p-6 rounded-2xl relative group"
                                            >
                                                <button
                                                    onClick={() => removeAttribute(attr.id)}
                                                    className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-border rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                                <div className="grid grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Attribute Name</label>
                                                        <input
                                                            type="text"
                                                            value={attr.name}
                                                            onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                                                            placeholder="e.g. Color"
                                                            className="w-full bg-white px-4 py-2.5 rounded-xl border border-border outline-none font-semibold text-sm focus:ring-2 ring-black/5 transition-all mt-1"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Values (Comma separated)</label>
                                                        <div className="mt-1 flex flex-wrap gap-2 items-center bg-white p-2 rounded-xl border border-border min-h-[42px]">
                                                            {attr.values.map((val, idx) => (
                                                                <span key={idx} className="bg-gray-100 text-gray-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-border">
                                                                    {val}
                                                                    <X onClick={() => removeAttributeValue(attr.id, idx)} className="w-3 h-3 cursor-pointer hover:text-red-500" />
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
                                                                className="flex-1 bg-transparent border-none outline-none text-[11px] font-semibold uppercase tracking-wider px-2"
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
                                            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <Sparkles className="w-4 h-4" /> Generate All Variations
                                        </button>
                                    )}
                                </div>

                                {/* Variants Grid */}
                                {variants.length > 0 && (
                                    <div className="space-y-6 pt-8 border-t border-border">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-900">2. Configure Variations ({variants.length})</p>

                                            {/* Bulk Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsMatrixSwapped(!isMatrixSwapped)}
                                                    className="px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-border bg-white text-black hover:bg-muted transition-all flex items-center gap-2"
                                                    title="Swap Matrix Axes"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                    Swap Axes
                                                </button>
                                                <button
                                                    onClick={() => setIsMatrixView(!isMatrixView)}
                                                    className={cn(
                                                        "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                                                        isMatrixView ? "bg-black text-white border-black" : "bg-white text-black border-border hover:bg-muted"
                                                    )}
                                                >
                                                    <Box className="w-3 h-3" />
                                                    {isMatrixView ? 'List View' : 'Matrix View'}
                                                </button>
                                                <select
                                                    value={bulkAction}
                                                    onChange={(e) => setBulkAction(e.target.value)}
                                                    className="bg-gray-100 border border-border px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none"
                                                >
                                                    <option value="">Bulk Actions</option>
                                                    <option value="Set Regular Prices">Set Regular Prices</option>
                                                    <option value="Set Stock Quantity">Set Stock Quantity</option>
                                                    <option value="Delete All Variations">Delete All Variations</option>
                                                </select>
                                                <button
                                                    onClick={applyBulkAction}
                                                    className="bg-black text-white px-5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:shadow-lg transition-all"
                                                >Apply</button>
                                            </div>
                                        </div>

<<<<<<< Updated upstream
                                        {isMatrixView && matrixData ? (
                                            <div className="overflow-x-auto ring-1 ring-border rounded-[2rem] bg-white shadow-xl">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-6 py-6 bg-muted/30 border-b border-r border-border italic">
                                                                <span className="text-[10px] font-black text-black uppercase tracking-widest font-mono">
                                                                    {matrixData.rowAttr} / {matrixData.colAttr}
                                                                </span>
                                                            </th>
                                                            {matrixData.colValues.map((col: string) => (
                                                                <th key={col} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-black text-center border-b border-border bg-muted/10 font-mono">
                                                                    {col}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {matrixData.rowValues.map((row: string) => (
                                                            <tr key={row} className="border-b border-border group">
                                                                <td className="px-6 py-5 font-black uppercase tracking-tighter text-xs italic border-r border-border bg-muted/5">
                                                                    {row}
                                                                </td>
                                                                {matrixData.colValues.map((col: string) => {
                                                                    const variant = matrixData.grid[row]?.[col];
                                                                    if (!variant) return <td key={col} className="bg-muted/5" />;
                                                                    return (
                                                                        <td key={col} className="p-4 bg-white group-hover:bg-muted/5 transition-all">
                                                                            <div className="flex flex-col gap-3 min-w-[120px]">
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[7px] font-black uppercase text-muted-foreground ml-1">Price ($)</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={variant.price}
                                                                                        onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                                                                                        className="w-full bg-muted/30 px-3 py-2 rounded-xl border-none outline-none font-bold text-[10px] focus:bg-white focus:ring-1 ring-black transition-all"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[7px] font-black uppercase text-muted-foreground ml-1">Stock</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={variant.stock}
                                                                                        onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                                                                                        className="w-full bg-muted/30 px-3 py-2 rounded-xl border-none outline-none font-bold text-[10px] focus:bg-white focus:ring-1 ring-black transition-all"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
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
                                                                                <label className="aspect-square bg-muted/20 border-2 border-dashed border-muted rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-black cursor-pointer group transition-all p-6 overflow-hidden relative">
                                                                                    <input
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        className="hidden"
                                                                                        onChange={(e) => handleVariantImageAdd(variant.id, e)}
                                                                                    />
                                                                                    {uploadingVariantId === variant.id ? (
                                                                                        <Loader2 className="w-6 h-6 animate-spin text-black" />
                                                                                    ) : (variant.image || images[0]) ? (
                                                                                        <>
                                                                                            <img src={variant.image || images[0]} className={cn("absolute inset-0 w-full h-full object-cover", !variant.image && "opacity-30 grayscale")} alt="Variant" />
                                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all text-white text-[8px] font-black uppercase gap-2">
                                                                                                <ImageIcon className="w-4 h-4" />
                                                                                                {variant.image ? "Change Image" : "Add Unique Image"}
                                                                                            </div>
                                                                                            {!variant.image && (
                                                                                                <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm p-2 rounded-xl text-white text-[6px] font-black uppercase text-center leading-tight">Using Global DNA Visual</div>
                                                                                            )}
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                                                                <Plus className="w-5 h-5" />
                                                                                            </div>
                                                                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground text-center">Add unique<br />image</p>
                                                                                        </>
                                                                                    )}
                                                                                </label>
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
=======
                                        <div className="space-y-6">
                                            {variants.map((variant, vIdx) => {
                                                const isExpanded = expandedVariants.includes(variant.id);
                                                return (
                                                    <motion.div
                                                        key={variant.id}
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: vIdx * 0.03 }}
                                                        className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                                                    >
                                                        {/* Row Header */}
                                                        <div
                                                            onClick={() => toggleVariant(variant.id)}
                                                            className="bg-gray-50/50 p-5 flex justify-between items-center cursor-pointer group hover:bg-gray-50 transition-all"
                                                        >
                                                            <div className="flex gap-5 items-center">
                                                                <div className="w-12 h-12 bg-white rounded-xl border border-border flex items-center justify-center shadow-inner overflow-hidden">
                                                                    {variant.image ? (
                                                                        <img src={variant.image} className="w-full h-full object-cover" alt="Variant" />
                                                                    ) : (
                                                                        <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex gap-1.5 items-center">
                                                                        {Object.entries(variant.combination).map(([k, v]) => (
                                                                            <span key={k} className="bg-white border border-border text-gray-900 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">{v}</span>
                                                                        ))}
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">SKU: {variant.sku || 'UNASSIGNED'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-8 items-center">
                                                                <div className="text-right">
                                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Price</p>
                                                                    <p className="text-sm font-bold text-gray-900">${variant.price || '0.00'}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Stock</p>
                                                                    <p className="text-sm font-bold text-green-600">{variant.stock || '0'}</p>
                                                                </div>
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-full flex items-center justify-center bg-white border border-border group-hover:bg-black group-hover:text-white transition-all",
                                                                    isExpanded && "bg-black text-white rotate-180"
                                                                )}>
                                                                    <ChevronDown className="w-3.5 h-3.5" />
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
                                                                    <div className="p-8 border-t border-border bg-white grid grid-cols-4 gap-8">
                                                                        {/* Left: Media */}
                                                                        <div className="space-y-3">
                                                                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Visual</label>
                                                                            <div
                                                                                onClick={() => handleVariantImageAdd(variant.id)}
                                                                                className="aspect-square bg-gray-50 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-black cursor-pointer group transition-all p-4 overflow-hidden relative"
                                                                            >
                                                                                {variant.image ? (
                                                                                    <>
                                                                                        <img src={variant.image} className="absolute inset-0 w-full h-full object-cover" alt="Variant" />
                                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[9px] font-bold uppercase">Change</div>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                                                            <Plus className="w-4 h-4" />
                                                                                        </div>
                                                                                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-center">Add Image</p>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Details */}
                                                                        <div className="col-span-3 grid grid-cols-2 gap-6">
                                                                            <div className="space-y-4">
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">SKU</label>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={variant.sku}
                                                                                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                                                        className="w-full bg-gray-50/50 px-4 py-2 rounded-xl border border-border outline-none font-semibold text-[11px] uppercase tracking-wider focus:bg-white focus:ring-2 ring-black/5 transition-all"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Price ($)</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={variant.price}
                                                                                        onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                                                                                        className="w-full bg-gray-50/50 px-4 py-2 rounded-xl border border-border outline-none font-semibold text-[11px] uppercase tracking-wider focus:bg-white focus:ring-2 ring-black/5 transition-all"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-4">
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Stock</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        value={variant.stock}
                                                                                        onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                                                                                        className="w-full bg-gray-50/50 px-4 py-2 rounded-xl border border-border outline-none font-semibold text-[11px] uppercase tracking-wider focus:bg-white focus:ring-2 ring-black/5 transition-all"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Status</label>
                                                                                    <select className="w-full bg-gray-50/50 px-4 py-2 rounded-xl border border-border outline-none font-semibold text-[11px] uppercase tracking-wider appearance-none focus:bg-white focus:ring-2 ring-black/5 transition-all cursor-pointer">
                                                                                        <option>In Stock</option>
                                                                                        <option>Out of Stock</option>
                                                                                        <option>On Backorder</option>
                                                                                    </select>
>>>>>>> Stashed changes
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
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {productType === 'simple' && (
                            <div className="space-y-8 pt-8 border-t border-border">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">SKU</label>
                                        <input
                                            type="text"
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value)}
                                            placeholder="e.g. U-BOOST-001"
                                            className="w-full bg-gray-50/50 px-5 py-3 rounded-xl border border-border outline-none font-semibold text-sm focus:bg-white focus:ring-2 ring-black/5 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Stock Status</label>
                                        <select className="w-full bg-gray-50/50 px-5 py-3 rounded-xl border border-border outline-none font-semibold text-sm appearance-none focus:bg-white focus:ring-2 ring-black/5 transition-all cursor-pointer">
                                            <option>In Stock</option>
                                            <option>Out of Stock</option>
                                            <option>On Backorder</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="py-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-gray-50/50 space-y-3">
                                    <Box className="w-8 h-8 mx-auto text-muted-foreground/20" />
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Pricing & Stock are managed in the Product Information section.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Taxonomy / Meta */}
                <div className="space-y-6">
                    <div className="bg-white border border-border p-6 rounded-3xl shadow-sm space-y-6">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-border pb-3">Taxonomy</h4>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-gray-50/50 px-4 py-2.5 rounded-xl border border-border outline-none font-bold uppercase tracking-wider text-[10px] appearance-none transition-all cursor-pointer focus:bg-white focus:ring-2 ring-black/5"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Brand</label>
                                <select
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="w-full bg-gray-50/50 px-4 py-2.5 rounded-xl border border-border outline-none font-bold uppercase tracking-wider text-[10px] appearance-none transition-all cursor-pointer focus:bg-white focus:ring-2 ring-black/5"
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-border p-6 rounded-3xl shadow-sm space-y-6">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-border pb-3">Visibility</h4>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                            <div>
                                <p className="text-[10px] font-bold uppercase text-green-700">Storefront Status</p>
                                <p className="text-[9px] font-medium text-green-600/80 uppercase">Active & Visible</p>
                            </div>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
