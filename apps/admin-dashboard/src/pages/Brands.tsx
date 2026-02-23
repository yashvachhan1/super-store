import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Edit2, Trash2, ExternalLink, Image as ImageIcon, Globe, Upload, Download, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Papa from "papaparse";
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Brand {
    id: string;
    name: string;
    logo: string;
    website: string;
    products: number;
    status: string;
    createdAt?: any;
}

export default function Brands() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<null | 'idle' | 'parsing' | 'success' | 'error'>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Form states
    const [newName, setNewName] = useState("");
    const [newWebsite, setNewWebsite] = useState("");
    const [newLogo, setNewLogo] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "brands"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const brandData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Brand[];
            setBrands(brandData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, "brands"), {
                name: newName,
                website: newWebsite,
                logo: newLogo,
                products: 0,
                status: "Active",
                createdAt: serverTimestamp()
            });
            setIsAdding(false);
            setNewName("");
            setNewWebsite("");
            setNewLogo("");
        } catch (error) {
            console.error("Error creating brand:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this brand?")) {
            await deleteDoc(doc(db, "brands", id));
        }
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadProgress('parsing');
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results: Papa.ParseResult<any>) => {
                try {
                    for (const item of results.data) {
                        await addDoc(collection(db, "brands"), {
                            name: item.name,
                            website: item.website || "",
                            logo: item.logo_url || "",
                            products: 0,
                            status: "Active",
                            createdAt: serverTimestamp()
                        });
                    }
                    setUploadProgress('success');
                } catch (error) {
                    console.error("CSV Import Error:", error);
                    setUploadProgress('error');
                }
            },
            error: (error: Error) => {
                setUploadProgress('error');
            }
        });
    };

    const downloadTemplate = () => {
        const csvContent = "name,website,logo_url\nNike,https://nike.com,https://example.com/nike.png\nAdidas,https://adidas.com,https://example.com/adidas.png";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "brand_template.csv");
        link.click();
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">Brands</h1>
                    <p className="text-muted-foreground font-medium">Manage your portfolio of elite partners.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsUploading(true)}
                        className="border border-border bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" /> Import CSV
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-black text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Brand
                    </button>
                </div>
            </div>

            {/* Bulk Upload Modal */}
            <AnimatePresence>
                {isUploading && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsUploading(false); setUploadProgress(null); }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3rem] p-12 max-w-xl w-full relative z-[201] shadow-2xl text-center"
                        >
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Bulk Import</h2>
                            <p className="text-muted-foreground text-sm font-medium mb-8">Upload a CSV file to add brands in batches.</p>

                            {uploadProgress === null && (
                                <div className="space-y-6">
                                    <div className="w-full border-2 border-dashed border-muted rounded-[2rem] p-16 flex flex-col items-center justify-center gap-4 hover:border-black cursor-pointer group transition-all relative">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCSVUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-widest">Drop or Click to Upload</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight mt-1">Accepts .CSV files only</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={downloadTemplate}
                                        className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-black transition-colors"
                                    >
                                        <Download className="w-3 h-3" /> Download CSV Template
                                    </button>
                                </div>
                            )}

                            {uploadProgress === 'parsing' && (
                                <div className="py-20 flex flex-col items-center gap-6">
                                    <div className="w-16 h-16 border-4 border-muted border-t-black rounded-full animate-spin" />
                                    <p className="text-[11px] font-black uppercase tracking-widest italic animate-pulse">Analyzing Data Integrity...</p>
                                </div>
                            )}

                            {uploadProgress === 'success' && (
                                <div className="py-20 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black uppercase tracking-tight">Import Successful!</p>
                                        <p className="text-sm font-medium text-muted-foreground mt-2">Brands have been added to your catalog.</p>
                                    </div>
                                    <button
                                        onClick={() => { setIsUploading(false); setUploadProgress(null); }}
                                        className="bg-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] mt-4"
                                    >
                                        Close & Refresh
                                    </button>
                                </div>
                            )}

                            {uploadProgress === 'error' && (
                                <div className="py-20 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                                        <XCircle className="w-10 h-10" />
                                    </div>
                                    <p className="text-xl font-black uppercase tracking-tight">Upload Failed</p>
                                    <button
                                        onClick={() => setUploadProgress(null)}
                                        className="bg-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] mt-4"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="glass overflow-hidden rounded-[3rem]">
                <div className="p-8 border-b border-border flex justify-between items-center bg-white/50">
                    <div className="flex items-center gap-4 bg-muted/50 px-6 py-3 rounded-full w-96">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Filter brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-widest w-full"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Brand</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Products</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                                    </td>
                                </tr>
                            ) : filteredBrands.map((brand, i) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={brand.id}
                                    className="group hover:bg-muted/30 transition-colors border-b border-border last:border-none"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-muted overflow-hidden border border-border flex-shrink-0">
                                                {brand.logo ? (
                                                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <ImageIcon className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-black uppercase tracking-tight text-sm italic">{brand.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <a href={brand.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-black transition-colors uppercase tracking-widest">
                                            <Globe className="w-3 h-3" />
                                            <span>{brand.website.replace('https://', '').replace('http://', '')}</span>
                                        </a>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="font-black italic text-sm">{brand.products}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{brand.status}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-black hover:text-white rounded-lg transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id)}
                                                className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-all text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Brand Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3rem] p-12 max-w-2xl w-full relative z-[201] shadow-2xl"
                        >
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-8">New Brand</h2>
                            <form className="space-y-6" onSubmit={handleCreateBrand}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="e.g. Nike"
                                            className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold uppercase tracking-widest text-xs focus:bg-white focus:ring-2 ring-black transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Official Website</label>
                                        <input
                                            type="text"
                                            value={newWebsite}
                                            onChange={(e) => setNewWebsite(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold uppercase tracking-widest text-xs focus:bg-white focus:ring-2 ring-black transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Logo URL</label>
                                    <input
                                        type="text"
                                        value={newLogo}
                                        onChange={(e) => setNewLogo(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold uppercase tracking-widest text-xs focus:bg-white focus:ring-2 ring-black transition-all"
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 bg-black text-white py-5 rounded-full font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all disabled:bg-muted-foreground"
                                    >
                                        {isSaving ? "Creating..." : "Create Brand"}
                                    </button>
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs border border-border hover:bg-muted transition-all">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

