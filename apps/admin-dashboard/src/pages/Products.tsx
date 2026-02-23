import { Plus, Search, Edit2, Trash2, Filter, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Product {
    id: string;
    name: string;
    category: string;
    brand: string;
    price: number;
    stock: number;
    type: string;
    images: string[];
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const q = query(collection(db, "products"), orderBy("name", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            setProducts(productData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", id));
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product.");
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">Products</h1>
                    <p className="text-muted-foreground font-medium">Manage your inventory with surgical precision.</p>
                </div>
                <div className="flex gap-4">
                    <button className="border border-border bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <Link to="/products/add">
                        <button className="bg-black text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border border-border shadow-sm">
                <div className="flex items-center gap-4 bg-muted/30 px-6 py-3 rounded-full flex-1 max-w-md group focus-within:bg-white focus-within:ring-2 ring-black transition-all">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products, brands, or SKUs..."
                        className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-full placeholder:text-muted-foreground/50"
                    />
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <select className="bg-muted/30 border-none outline-none px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer">
                        <option>All Categories</option>
                        {Array.from(new Set(products.map(p => p.category))).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="glass overflow-hidden rounded-[3rem]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-black" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Syncing Catalog...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">No products found in the database.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-black/5">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="group hover:bg-black/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-muted flex items-center justify-center border border-border group-hover:scale-110 transition-transform duration-500 text-muted-foreground/30">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Search className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-tighter italic">{product.name}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">{product.brand}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                            product.type === "simple" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                                        )}>
                                            {product.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-[10px] font-bold uppercase text-muted-foreground">{product.category}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-orange-500" : "bg-red-500"
                                            )} />
                                            <span className="text-[10px] font-black uppercase">{product.stock} In Stock</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-[11px] font-black italic tracking-tight">${product.price}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            <Link to={`/products/edit/${product.id}`} className="p-2 hover:bg-black hover:text-white rounded-xl transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
