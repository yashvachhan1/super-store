import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings as SettingsIcon,
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
  Ticket,
  BookOpen,
  LogOut,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import Blogs from "./pages/Blogs";
import AddBlog from "./pages/AddBlog";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Discounts from "./pages/Discounts";
import AddDiscount from "./pages/AddDiscount";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

// Mock Data / Components (Will extract later)
const Overview = () => {
  const [customerCount, setCustomerCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const custUnsubscribe = onSnapshot(collection(db, "customers"), (snapshot) => {
      setCustomerCount(snapshot.size);
    });

    const ordersUnsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrderCount(snapshot.size);
      const total = snapshot.docs.reduce((acc, doc) => acc + (doc.data().total || 0), 0);
      setRevenue(total);
    });

    return () => {
      custUnsubscribe();
      ordersUnsubscribe();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Command Center</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Real-time pulse of your Super Store empire.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-black text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stat Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: `$${revenue.toLocaleString()}`, change: "+12.5%", icon: TrendingUp },
          { label: "Total Orders", value: orderCount.toString(), change: "+3 today", icon: Box },
          { label: "Total Customers", value: customerCount.toString(), change: "+0", icon: Users },
          { label: "Conversion Rate", value: "3.2%", change: "+0.4%", icon: ArrowUpRight },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white border border-border p-6 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-muted rounded-xl">
                <stat.icon className="w-5 h-5 text-black" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{stat.change}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity / Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border p-8 rounded-[2rem] min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Stream</h3>
          <div className="h-full flex items-center justify-center text-muted-foreground/30 font-semibold text-2xl tracking-tight">
            Visualization Engine Loading...
          </div>
        </div>
        <div className="bg-white border border-border p-8 rounded-[2rem]">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Live Feed</h3>
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-9 h-9 bg-muted rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900 leading-none mb-1.5">New Order #482{i}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">2 minutes ago</p>
                </div>
                <span className="text-xs font-bold text-gray-900">$120</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }: any) => (
  <Link to={href}>
    <div className={cn(
      "relative group flex items-center rounded-xl transition-all duration-200",
      collapsed ? "justify-center px-0 py-3.5" : "gap-3.5 px-5 py-3.5",
      active
        ? "bg-black text-white shadow-xl shadow-black/10"
        : "text-muted-foreground hover:bg-muted/80 hover:text-black"
    )}>
      <Icon className={cn("w-4.5 h-4.5 flex-shrink-0", active ? "text-white" : "text-muted-foreground")} />
      {!collapsed && (
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
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
        animate={{ width: collapsed ? 80 : 280 }}
        className="fixed left-0 top-0 h-screen bg-white border-r border-border p-4 z-[100] flex flex-col"
      >
        <div className="flex items-center gap-3.5 mb-12 px-2.5">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight uppercase whitespace-nowrap">Super Admin</span>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 no-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Overview" href="/" active={location.pathname === "/"} collapsed={collapsed} />
          <SidebarItem icon={ShoppingBag} label="Products" href="/products" active={location.pathname === "/products"} collapsed={collapsed} />
          <SidebarItem icon={Layers} label="Categories" href="/categories" active={location.pathname === "/categories"} collapsed={collapsed} />
          <SidebarItem icon={Tag} label="Brands" href="/brands" active={location.pathname === "/brands"} collapsed={collapsed} />
          <SidebarItem icon={Box} label="Orders" href="/orders" active={location.pathname === "/orders"} collapsed={collapsed} />
          <SidebarItem icon={Ticket} label="Discounts" href="/discounts" active={location.pathname === "/discounts"} collapsed={collapsed} />
          <SidebarItem icon={Users} label="Customers" href="/customers" active={location.pathname === "/customers"} collapsed={collapsed} />
          <SidebarItem icon={BookOpen} label="Journal" href="/blogs" active={location.pathname.startsWith("/blogs")} collapsed={collapsed} />
          <SidebarItem icon={CreditCard} label="Billing" href="/billing" active={location.pathname === "/billing"} collapsed={collapsed} />
          <SidebarItem icon={SettingsIcon} label="Settings" href="/settings" active={location.pathname === "/settings"} collapsed={collapsed} />
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-border">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center text-red-500 hover:bg-red-50 rounded-xl transition-all",
              collapsed ? "justify-center py-3.5" : "gap-4 px-5 py-3.5"
            )}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
            {!collapsed && <span className="text-[10px] font-bold uppercase tracking-wider">Terminate Link</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full flex items-center text-muted-foreground hover:text-black transition-colors",
              collapsed ? "justify-center py-3.5" : "gap-4 px-5 py-3.5"
            )}
          >
            <Menu className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-[10px] font-bold uppercase tracking-wider">Minimize View</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen pb-10",
        collapsed ? "ml-[80px]" : "ml-[280px]"
      )}>
        {/* Navbar */}
        <header className="sticky top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/10 px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3.5 bg-muted/30 px-5 py-2.5 rounded-xl group focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 focus-within:shadow-sm transition-all">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search resources..."
              className="bg-transparent border-none outline-none text-[11px] font-semibold uppercase tracking-wider w-64 placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="relative cursor-pointer group p-2 hover:bg-muted/50 rounded-lg transition-colors">
              <Bell className="w-4.5 h-4.5 text-muted-foreground group-hover:text-black transition-colors" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
            </div>
            <div className="flex items-center gap-3.5 pl-5 border-l border-border">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-gray-900">{user?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest">Global Ops</p>
              </div>
              <div className="w-9 h-9 bg-black rounded-full border border-white shadow shadow-black/10 overflow-hidden flex items-center justify-center text-white font-bold text-xs uppercase">
                {user?.email?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="px-8 py-10">
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
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/discounts/add" element={<AddDiscount />} />
            <Route path="/discounts/edit/:id" element={<AddDiscount />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

