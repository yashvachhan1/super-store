import { useState, useEffect } from "react";
import { ArrowLeft, Image as ImageIcon, Sparkles, X, FileText, Layout, Type, Plus, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { db, storage } from "@/lib/firebase";
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
    const [isUploadingImage, setIsUploadingImage] = useState(false);

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

    const handleFileUpload = async (file: File) => {
        setIsUploadingImage(true);
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
            setIsUploadingImage(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await handleFileUpload(file);
            if (base64) setImage(base64);
        }
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
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Loading content...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/blogs')}
                        className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-all group bg-white"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{id ? 'Edit' : 'Create'} Post</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">Draft and publish your next brand story.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleSave('Draft')}
                        disabled={isPublishing}
                        className="bg-white border border-border text-gray-900 px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all disabled:opacity-50"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave('Published')}
                        disabled={isPublishing}
                        className="bg-black text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        {isPublishing ? "Processing..." : id ? "Update Post" : "Publish Post"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Editor Side */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Content Area */}
                    <div className="bg-white border border-border p-8 rounded-3xl shadow-sm space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Post Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter post title..."
                                    className="w-full bg-gray-50/50 px-6 py-4 rounded-2xl border border-border outline-none font-bold text-2xl focus:bg-white focus:ring-2 ring-black/5 transition-all text-gray-900"
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Content Body</label>
                                <div className="absolute top-10 right-6 flex gap-2">
                                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-muted-foreground"><Type className="w-3.5 h-3.5" /></button>
                                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-muted-foreground"><Layout className="w-3.5 h-3.5" /></button>
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="The narrative begins here..."
                                    rows={20}
                                    className="w-full bg-gray-50/50 px-8 py-8 rounded-2xl border border-border outline-none font-medium text-base leading-relaxed focus:bg-white focus:ring-2 ring-black/5 transition-all resize-none mt-2 shadow-inner"
                                />
                                <div className="absolute bottom-4 right-8">
                                    <p className="text-[9px] font-bold uppercase text-muted-foreground/40">{content.length} characters</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Side */}
                <div className="space-y-8">
                    {/* Featured Image */}
                    <div className="bg-white border border-border p-6 rounded-3xl shadow-sm space-y-6">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-border pb-3 flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5" /> Featured Image
                        </h4>

                        <div
<<<<<<< Updated upstream
                            onClick={() => document.getElementById('blog-image-upload')?.click()}
                            className="aspect-[4/3] bg-muted/30 border-2 border-dashed border-muted rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-black cursor-pointer group transition-all relative overflow-hidden"
=======
                            onClick={handleUploadImage}
                            className="aspect-video bg-gray-50 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-black cursor-pointer group transition-all relative overflow-hidden"
>>>>>>> Stashed changes
                        >
                            <input
                                id="blog-image-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {isUploadingImage ? (
                                <Loader2 className="w-8 h-8 animate-spin text-black" />
                            ) : image ? (
                                <>
                                    <img src={image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Featured" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                        <p className="text-white text-[9px] font-bold uppercase tracking-widest">Change Visual</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setImage(''); }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-white border border-border rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm"
                                    >
                                        <X className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-white border border-border rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Add Visual</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="bg-white border border-border p-6 rounded-3xl shadow-sm space-y-6">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 border-b border-border pb-3 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" /> Post Settings
                        </h4>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-gray-50/50 px-4 py-2.5 rounded-xl border border-border outline-none font-bold uppercase tracking-wider text-[10px] appearance-none transition-all cursor-pointer focus:bg-white"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Footwear">Footwear</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Sustainability">Sustainability</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Status</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                                    {['Draft', 'Published'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setStatus(s)}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all",
                                                status === s ? "bg-white text-gray-900 shadow-sm border border-border" : "text-muted-foreground hover:text-gray-900"
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
                    <div className="p-8 rounded-3xl bg-black text-white space-y-6 shadow-xl relative overflow-hidden group">
                        <Sparkles className="absolute -top-4 -right-4 w-20 h-20 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
                        <h4 className="text-[11px] font-bold uppercase tracking-wider border-b border-white/10 pb-3 relative z-10 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" /> Creative Assistant
                        </h4>
                        <p className="text-[10px] font-medium text-white/50 relative z-10 leading-relaxed uppercase tracking-wider">Need a professional brand narrative for this post?</p>
                        <button className="w-full bg-white text-black py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform relative z-10 shadow-lg">
                            Auto-Generate Story
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

