import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  Box,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
  Store,
  Layers,
  Tag,
  BookOpen,
  LogOut,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Blogs from "./pages/Blogs";
import AddBlog from "./pages/AddBlog";
import Login from "./pages/Login";

// Mock Data / Components (Will extract later)
const Overview = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Command Center</h1>
        <p className="text-muted-foreground font-medium">Real-time pulse of your Super Store empire.</p>
      </div>
      <div className="flex gap-4">
        <button className="bg-black text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all">
          Generate Report
        </button>
      </div>
    </div>

    {/* Stat Widgets */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: "Total Revenue", value: "$128,430", change: "+12.5%", icon: TrendingUp },
        { label: "Active Orders", value: "42", change: "+3 today", icon: Box },
        { label: "Total Customers", value: "1,240", change: "+18%", icon: Users },
        { label: "Conversion Rate", value: "3.2%", change: "+0.4%", icon: ArrowUpRight },
      ].map((stat, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={stat.label}
          className="glass p-8 rounded-[2.5rem] relative overflow-hidden group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-black text-white rounded-2xl">
              <stat.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full">{stat.change}</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
          <h3 className="text-3xl font-black tracking-tighter italic">{stat.value}</h3>
        </motion.div>
      ))}
    </div>

    {/* Recent Activity / Charts Placeholder */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 glass p-10 rounded-[3rem] min-h-[400px]">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Revenue Stream</h3>
        <div className="h-full flex items-center justify-center text-muted-foreground/20 italic font-black text-4xl uppercase tracking-widest">
          Chart Logic Coming Soon
        </div>
      </div>
      <div className="glass p-10 rounded-[3rem]">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Live Feed</h3>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-muted rounded-2xl flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase leading-none mb-1">New Order #482{i}</p>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tight">2 minutes ago</p>
              </div>
              <span className="text-xs font-black italic">$120</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }: any) => (
  <Link to={href}>
    <div className={cn(
      "relative group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300",
      active ? "bg-black text-white shadow-2xl" : "text-muted-foreground hover:bg-muted/50"
    )}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  </Link>
);

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Synchronizing Neural Link...</p>
      </div>
    );
  }

  if (!user && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === "/login") {
    return <Routes><Route path="/login" element={<Login />} /></Routes>;
  }

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 100 : 300 }}
        className="fixed left-0 top-0 h-screen bg-white border-r border-border p-6 z-[100] flex flex-col"
      >
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Super Admin</span>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Overview" href="/" active={location.pathname === "/"} collapsed={collapsed} />
          <SidebarItem icon={ShoppingBag} label="Products" href="/products" active={location.pathname === "/products"} collapsed={collapsed} />
          <SidebarItem icon={Layers} label="Categories" href="/categories" active={location.pathname === "/categories"} collapsed={collapsed} />
          <SidebarItem icon={Tag} label="Brands" href="/brands" active={location.pathname === "/brands"} collapsed={collapsed} />
          <SidebarItem icon={Box} label="Orders" href="/orders" active={location.pathname === "/orders"} collapsed={collapsed} />
          <SidebarItem icon={Users} label="Customers" href="/customers" active={location.pathname === "/customers"} collapsed={collapsed} />
          <SidebarItem icon={BookOpen} label="Journal" href="/blogs" active={location.pathname.startsWith("/blogs")} collapsed={collapsed} />
          <SidebarItem icon={CreditCard} label="Billing" href="/billing" active={location.pathname === "/billing"} collapsed={collapsed} />
          <SidebarItem icon={Settings} label="Settings" href="/settings" active={location.pathname === "/settings"} collapsed={collapsed} />
        </nav>

        <div className="mt-auto space-y-4 pt-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Terminate Link</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full px-6 py-4 flex items-center gap-4 text-muted-foreground hover:text-black transition-colors"
          >
            <Menu className="w-6 h-6" />
            {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Minimize</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen pb-20",
        collapsed ? "ml-[100px]" : "ml-[300px]"
      )}>
        {/* Navbar */}
        <header className="sticky top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/10 px-10 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4 bg-muted/30 px-6 py-3 rounded-full group focus-within:bg-white focus-within:shadow-xl transition-all">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search resources..."
              className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-widest w-64 placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer group">
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-black transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <div className="flex items-center gap-4 pl-6 border-l border-border">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase">{user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Global Admin</p>
              </div>
              <div className="w-10 h-10 bg-black rounded-full border-2 border-white shadow-lg overflow-hidden flex items-center justify-center text-white font-black text-xs uppercase">
                {user?.email?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="px-10 py-12">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<AddProduct />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/add" element={<AddBlog />} />
            <Route path="/blogs/edit/:id" element={<AddBlog />} />
            <Route path="/orders" element={<div className="text-4xl font-black uppercase italic tracking-tighter">Orders Module</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

