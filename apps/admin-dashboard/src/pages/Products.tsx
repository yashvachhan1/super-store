<<<<<<< Updated upstream
import { Plus, Search, Edit2, Trash2, Filter, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
=======
import { Plus, Search, Edit2, Trash2, Filter, Download, Loader2, Image as ImageIcon } from "lucide-react";

>>>>>>> Stashed changes
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
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Manage and track your entire inventory catalog.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-border text-gray-900 px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all flex items-center gap-2">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                    <Link to="/products/add">
                        <button className="bg-black text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-3 bg-gray-50/50 border border-border px-5 py-2.5 rounded-xl flex-1 max-w-md group focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products, brands, or SKUs..."
                        className="bg-transparent border-none outline-none text-[11px] font-semibold uppercase tracking-wider w-full placeholder:text-muted-foreground/40"
                    />
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all">
                        <Filter className="w-3.5 h-3.5" /> Filters
                    </button>
                    <select className="bg-gray-50/50 border border-border outline-none px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest appearance-none cursor-pointer focus:bg-white transition-all">
                        <option>All Categories</option>
                        {Array.from(new Set(products.map(p => p.category))).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-border overflow-hidden rounded-[2rem] shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-black" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Syncing Catalog...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/30">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">No products found in the database.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border transition-transform duration-300 text-muted-foreground/30 flex-shrink-0">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 leading-tight">{product.name}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">{product.brand}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full",
                                            product.type === "simple" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                                        )}>
                                            {product.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[11px] font-bold uppercase text-muted-foreground">{product.category}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-orange-500" : "bg-red-500"
                                            )} />
                                            <span className="text-[10px] font-bold uppercase text-gray-900">{product.stock} Units</span>
                                        </div>
                                    </td>
<<<<<<< Updated upstream
                                    <td className="px-8 py-6 text-[11px] font-black italic tracking-tight">${product.price}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            <Link to={`/products/edit/${product.id}`} className="p-2 hover:bg-black hover:text-white rounded-xl transition-all">
                                                <Edit2 className="w-4 h-4" />
=======
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">${product.price}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link to={`/products/edit/${product.id}`}>
                                                <button className="p-2 hover:bg-black hover:text-white rounded-lg transition-all text-gray-400">
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
>>>>>>> Stashed changes
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-all text-red-500"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
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
