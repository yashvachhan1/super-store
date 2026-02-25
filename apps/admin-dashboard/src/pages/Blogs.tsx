import { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Blog {
    id: string;
    title: string;
    author: string;
    category: string;
    status: string;
    date: string;
    image: string;
    createdAt?: any;
}

export default function Blogs() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const blogData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Blog[];
            setBlogs(blogData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await deleteDoc(doc(db, "blogs", id));
            } catch (error) {
                console.error("Error deleting blog:", error);
                alert("Failed to delete the post.");
            }
        }
    };

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10">
            {/* Header Area */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Blog Posts</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Manage your brand's narrative and editorial content.</p>
                </div>
                <button
                    onClick={() => navigate('/blogs/add')}
                    className="bg-black text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Create Post
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4">
                <div className="flex-1 bg-white px-6 py-3 rounded-xl flex items-center gap-3 border border-border focus-within:ring-2 ring-black/5 transition-all">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search post title or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-muted-foreground/50"
                    />
                </div>
                <button className="bg-white px-6 py-3 rounded-xl border border-border flex items-center gap-3 hover:bg-muted transition-all group">
                    <span className="text-[10px] font-bold uppercase tracking-wider">All Categories</span>
                    <Plus className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="py-40 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Loading brand archive...</p>
                </div>
            )}

            {/* Blog Grid */}
            {!loading && (
                <div className="grid grid-cols-1 gap-4">
                    {filteredBlogs.map((blog, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={blog.id}
                            className="bg-white p-4 rounded-2xl flex items-center gap-6 group hover:shadow-md transition-all border border-border"
                        >
                            <div className="w-40 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border relative">
                                <img src={blog.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={blog.title} />
                                <div className="absolute top-2 left-2">
                                    <span className="bg-white/90 backdrop-blur shadow-sm text-gray-900 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-border">{blog.category}</span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <span className={cn(
                                        "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                                        blog.status === 'Published' ? "text-green-600 bg-green-50 border border-green-100" : "text-yellow-600 bg-yellow-50 border border-yellow-100"
                                    )}>
                                        {blog.status}
                                    </span>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {blog.date}
                                    </p>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-0.5">{blog.title}</h3>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Author: {blog.author}
                                </p>
                            </div>

                            <div className="flex gap-2 pr-2">
                                <button
                                    onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                                    className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all bg-white"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(blog.id)}
                                    className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all bg-white"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredBlogs.length === 0 && (
                <div className="py-40 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center opacity-40">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-2xl font-bold text-gray-900">Archive is Empty</h4>
                        <p className="text-sm font-medium text-muted-foreground">Start drafting your first story to build your brand narrative.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

