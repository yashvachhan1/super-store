import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Edit3, Trash2, BookOpen, Loader2 } from "lucide-react";
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
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Editorial Journal</h1>
                    <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em] mt-2">Manage your story and brand narrative.</p>
                </div>
                <button
                    onClick={() => navigate('/blogs/add')}
                    className="bg-black text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all flex items-center gap-3"
                >
                    <Plus className="w-4 h-4" /> Create New Post
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4">
                <div className="flex-1 glass px-8 py-4 rounded-full flex items-center gap-4 bg-white/50 focus-within:bg-white focus-within:shadow-xl transition-all border border-border">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-widest w-full"
                    />
                </div>
                <div className="glass px-10 py-4 rounded-full border border-border flex items-center gap-4 cursor-pointer hover:bg-black hover:text-white transition-all group">
                    <span className="text-[10px] font-black uppercase tracking-widest">Filter: All Categories</span>
                    <Plus className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="py-40 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Syncing with Archive...</p>
                </div>
            )}

            {/* Blog Grid */}
            {!loading && (
                <div className="grid grid-cols-1 gap-6">
                    {filteredBlogs.map((blog, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={blog.id}
                            className="glass bg-white p-6 rounded-[2.5rem] flex items-center gap-8 group hover:shadow-2xl transition-all border border-border"
                        >
                            <div className="w-48 h-32 rounded-[1.5rem] overflow-hidden bg-muted flex-shrink-0 border border-border">
                                <img src={blog.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={blog.title} />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-black text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">{blog.category}</span>
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border",
                                        blog.status === 'Published' ? "border-green-500 text-green-500 bg-green-50" : "border-yellow-500 text-yellow-500 bg-yellow-50"
                                    )}>
                                        {blog.status}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-1">{blog.title}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    By {blog.author} <span className="w-1 h-1 bg-muted-foreground rounded-full" /> {blog.date}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(blog.id)}
                                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredBlogs.length === 0 && (
                <div className="py-40 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center opacity-20">
                        <BookOpen className="w-12 h-12 text-black" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter">Journal is Empty</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synthesize your first brand story to begin.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

