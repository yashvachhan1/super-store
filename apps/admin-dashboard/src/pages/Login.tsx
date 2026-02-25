import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if user has admin privileges
            const userDoc = await getDoc(doc(db, "customers", user.uid));

            if (userDoc.exists() && userDoc.data().role !== 'admin') {
                await signOut(auth);
                setError("Access denied. Customer accounts cannot access the admin panel.");
                return;
            }

            navigate("/");
        } catch (err: any) {
            console.error("Login Error:", err);
            setError("Invalid credentials. Access denied.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Store className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sign in</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Super Store Control Panel</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-black/10" />

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@superstore.com"
                                required
                                className="w-full bg-gray-50/50 px-5 py-3 rounded-xl border border-border outline-none font-semibold text-sm focus:bg-white focus:ring-2 ring-black/5 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-0.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase cursor-pointer hover:text-black">Forgot?</span>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-gray-50/50 px-5 py-3 rounded-xl border border-border outline-none font-semibold text-sm focus:bg-white focus:ring-2 ring-black/5 transition-all"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                <div className="mt-10 flex items-center justify-center gap-8 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Secure session</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
