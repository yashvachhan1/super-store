import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Store, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";


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
            await signInWithEmailAndPassword(auth, email, password);
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
                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">Super Admin</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[9px] mt-2">Authorization Required</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-black/10" />

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Admin Identity</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@superstore.com"
                                required
                                className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold text-xs focus:bg-white focus:ring-2 ring-black transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Key</label>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase cursor-pointer hover:text-black">Forgot?</span>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold text-xs focus:bg-white focus:ring-2 ring-black transition-all"
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
                            className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all flex items-center justify-center gap-2 group disabled:bg-muted-foreground"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Establish Link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Session</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
