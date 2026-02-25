import { useState, useEffect } from "react";
import { ArrowLeft, Image as ImageIcon, Sparkles, X, FileText, Layout, Type, Plus, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

export default function AddBlog() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('Draft');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (id) {
            fetchBlog(id);
        }
    }, [id]);

    const fetchBlog = async (blogId: string) => {
        setIsFetching(true);
        try {
            const docRef = doc(db, "blogs", blogId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTitle(data.title);
                setContent(data.content);
                setStatus(data.status);
                setCategory(data.category);
                setImage(data.image);
            }
        } catch (error) {
            console.error("Error fetching blog:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleUploadImage = () => {
        const url = prompt("Enter Blog Header Image URL (Demo):");
        if (url) setImage(url);
    };

    const handleSave = async (forceStatus?: string) => {
        if (!title) {
            alert("Title is required");
            return;
        }

        setIsPublishing(true);
        try {
            const blogData = {
                title,
                content,
                status: forceStatus || status,
                category,
                image,
                slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                author: "Yash Vardhan", // Hardcoded for now
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                updatedAt: serverTimestamp(),
            };

            if (id) {
                await updateDoc(doc(db, "blogs", id), blogData);
            } else {
                await addDoc(collection(db, "blogs"), {
                    ...blogData,
                    createdAt: serverTimestamp(),
                });
            }

            navigate('/blogs');
        } catch (error) {
            console.error("Error saving blog:", error);
            alert("Failed to save post.");
        } finally {
            setIsPublishing(false);
        }
    };

    if (isFetching) {
        return (
            <div className="h-screen flex items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest">Accessing Story Core...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/blogs')}
                        className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-black hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">{id ? 'Edit' : 'Create'} Journal</h1>
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest mt-1">Editorial Protocol Engaged</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleSave('Draft')}
                        disabled={isPublishing}
                        className="px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] border border-border hover:bg-muted transition-all disabled:opacity-50"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(status === 'Published' ? 'Published' : 'Published')}
                        disabled={isPublishing}
                        className="px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] bg-black text-white hover:shadow-2xl transition-all flex items-center gap-3 disabled:bg-muted-foreground"
                    >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isPublishing ? "Synthesizing..." : id ? "Update Post" : "Publish Post"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Editor Side */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Content Area */}
                    <div className="glass p-10 rounded-[3.5rem] space-y-10 border border-border bg-white shadow-sm overflow-hidden relative">
                        {/* Decorative Top Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent" />

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Post Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="DESIGNING THE FUTURE OF FOOTWEAR"
                                    className="w-full bg-muted/20 px-10 py-8 rounded-[2.5rem] border-none outline-none font-black italic tracking-tighter text-3xl focus:bg-white focus:ring-4 ring-black/5 transition-all text-black uppercase"
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Content Body</label>
                                <div className="absolute top-10 right-10 flex gap-2">
                                    <button className="p-2 hover:bg-black hover:text-white rounded-lg transition-all"><Type className="w-4 h-4" /></button>
                                    <button className="p-2 hover:bg-black hover:text-white rounded-lg transition-all"><Layout className="w-4 h-4" /></button>
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="The narrative begins here..."
                                    rows={20}
                                    className="w-full bg-muted/20 px-10 py-10 rounded-[3rem] border-none outline-none font-medium text-lg leading-relaxed focus:bg-white focus:ring-4 ring-black/5 transition-all resize-none mt-2 shadow-inner"
                                />
                                <div className="absolute bottom-6 right-10">
                                    <p className="text-[9px] font-black uppercase text-muted-foreground/30">{content.length} characters</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Side */}
                <div className="space-y-8">
                    {/* Featured Image */}
                    <div className="glass p-8 rounded-[3rem] space-y-6 border border-border bg-white shadow-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-border pb-4 flex items-center gap-2">
                            <ImageIcon className="w-3 h-3" /> Featured Visual
                        </h4>

                        <div
                            onClick={handleUploadImage}
                            className="aspect-[4/3] bg-muted/30 border-2 border-dashed border-muted rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-black cursor-pointer group transition-all relative overflow-hidden"
                        >
                            {image ? (
                                <>
                                    <img src={image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Featured" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <button className="bg-white text-black px-6 py-2 rounded-full text-[9px] font-black uppercase">Change Image</button>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setImage(''); }}
                                        className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:bg-black group-hover:text-white transition-all transform group-hover:scale-110">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload Header</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="glass p-8 rounded-[3rem] space-y-6 border border-border bg-white shadow-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-border pb-4 flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Post Config
                        </h4>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-muted/30 px-6 py-5 rounded-2xl border-none outline-none font-bold uppercase tracking-widest text-[10px] focus:bg-white focus:ring-1 ring-black transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Footwear">Footwear</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Sustainability">Sustainability</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Publication Status</label>
                                <div className="flex bg-muted/30 p-1.5 rounded-full gap-1">
                                    {['Draft', 'Published'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setStatus(s)}
                                            className={cn(
                                                "flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                                status === s ? "bg-black text-white shadow-xl" : "text-muted-foreground hover:text-black"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Tools */}
                    <div className="p-8 rounded-[3rem] bg-black text-white space-y-6 shadow-2xl relative overflow-hidden group">
                        <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-4 relative z-10 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> Creative Intel
                        </h4>
                        <p className="text-[10px] font-medium text-white/50 relative z-10 leading-relaxed uppercase tracking-tight">Need a professional brand narrative for this post?</p>
                        <button className="w-full bg-white text-black py-4 rounded-full font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-transform relative z-10 shadow-xl">
                            Auto-Generate Story
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

