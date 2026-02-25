import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    setDoc,
    serverTimestamp,
    writeBatch,
    deleteDoc
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Mail,
    Calendar,
    Shield,
    Loader2,
    UserCircle,
    Plus,
    X,
    Lock,
    Unlock,
    Trash2,
    Check,
    ChevronDown,
    UserPlus
} from "lucide-react";

interface Customer {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: any;
    status: string;
}

interface CustomerRole {
    id: string;
    name: string;
    createdAt: any;
}

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Manual Add State
    const [isAdding, setIsAdding] = useState(false);
    const [newCustomer, setNewCustomer] = useState<{ name: string, email: string, role: string }>({ name: "", email: "", role: "customer" });
    const [isSaving, setIsSaving] = useState(false);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

    // Role Management State
    const [isManagingRoles, setIsManagingRoles] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<CustomerRole[]>([]);
    const [newRoleName, setNewRoleName] = useState("");
    const [isSavingRole, setIsSavingRole] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Customer[];
            setCustomers(data);
            setLoading(false);
        });

        // Listen for roles
        const rolesQ = query(collection(db, "customerRoles"), orderBy("createdAt", "asc"));
        const rolesUnsubscribe = onSnapshot(rolesQ, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CustomerRole[];
            setAvailableRoles(data);
        });

        return () => {
            unsubscribe();
            rolesUnsubscribe();
        };
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Generate a simple ID or let Firebase do it? We use email as a hint or just random.
            const customerId = `cust_${Math.random().toString(36).substr(2, 9)}`;
            await setDoc(doc(db, "customers", customerId), {
                ...newCustomer,
                status: 'Active',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
            setIsAdding(false);
            setNewCustomer({ name: "", email: "", role: "customer" });
        } catch (err) {
            console.error("Error adding customer:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCustomers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCustomers.map(c => c.id));
        }
    };

    const bulkUpdateStatus = async (status: string) => {
        setIsBulkUpdating(true);
        const batch = writeBatch(db);
        selectedIds.forEach(id => {
            const ref = doc(db, "customers", id);
            batch.update(ref, { status });
        });
        await batch.commit();
        setIsBulkUpdating(false);
        setSelectedIds([]);
    };

    const bulkUpdateRole = async (role: string) => {
        setIsBulkUpdating(true);
        const batch = writeBatch(db);
        selectedIds.forEach(id => {
            const ref = doc(db, "customers", id);
            batch.update(ref, { role });
        });
        await batch.commit();
        setIsBulkUpdating(false);
        setSelectedIds([]);
        setIsRoleDropdownOpen(false);
    };

    const handleDeleteCustomer = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customer?")) return;
        try {
            await deleteDoc(doc(db, "customers", id));
        } catch (err) {
            console.error("Error deleting customer:", err);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} customers?`)) return;
        setIsBulkUpdating(true);
        const batch = writeBatch(db);
        selectedIds.forEach(id => {
            const ref = doc(db, "customers", id);
            batch.delete(ref);
        });
        await batch.commit();
        setIsBulkUpdating(false);
        setSelectedIds([]);
    };

    const handleAddRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        setIsSavingRole(true);
        try {
            const roleId = `role_${Date.now()}`;
            await setDoc(doc(db, "customerRoles", roleId), {
                name: newRoleName.trim(),
                createdAt: serverTimestamp()
            });
            setNewRoleName("");
        } catch (err) {
            console.error("Error adding role:", err);
        } finally {
            setIsSavingRole(false);
        }
    };

    const handleDeleteRole = async (id: string) => {
        try {
            await deleteDoc(doc(db, "customerRoles", id));
        } catch (err) {
            console.error("Error deleting role:", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customers</h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Manage and verify your global user database.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsManagingRoles(true)}
                        className="bg-white text-black px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-border hover:shadow-md transition-all flex items-center gap-2"
                    >
                        <Shield className="w-4 h-4" /> Manage Roles
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-black text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Customer
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
                <div className="flex-1 flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full font-medium"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white border border-border rounded-[2rem] overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-black" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Syncing Database...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/30">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">No customers found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse border-spacing-0">
                        <thead>
                            <tr className="border-b border-border bg-gray-50/50">
                                <th className="px-6 py-4 w-10">
                                    <div
                                        onClick={toggleSelectAll}
                                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors
                                            ${selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0
                                                ? 'bg-black border-black'
                                                : 'border-gray-300 hover:border-black'}`}
                                    >
                                        {selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0 && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User Identity</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Privileges</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Joined At</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer, i) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    key={customer.id}
                                    className={`group hover:bg-muted/30 transition-colors border-b border-border last:border-none
                                        ${selectedIds.includes(customer.id) ? 'bg-muted/50' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div
                                            onClick={() => toggleSelection(customer.id)}
                                            className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors
                                                ${selectedIds.includes(customer.id) ? 'bg-black border-black' : 'border-gray-300 group-hover:border-black'}`}
                                        >
                                            {selectedIds.includes(customer.id) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                                                <UserCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900 leading-none mb-1">{customer.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {customer.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide
                                            ${customer.role === 'admin' ? 'bg-black text-white' : 'bg-muted text-gray-600'}`}>
                                            <Shield className="w-3 h-3" />
                                            {customer.role || 'customer'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {customer.createdAt?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || 'Nov 12, 2025'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">{customer.status || 'Active'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleDeleteCustomer(customer.id)}
                                                className="p-2 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Bulk Action Panel */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-8 z-[200] border border-white/10"
                    >
                        <div className="flex items-center gap-3 pr-8 border-r border-white/10">
                            <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                                {selectedIds.length}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Selected</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => bulkUpdateStatus('Active')}
                                disabled={isBulkUpdating}
                                className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                            >
                                <Unlock className="w-3.5 h-3.5" /> Set Active
                            </button>
                            <button
                                onClick={() => bulkUpdateStatus('Inactive')}
                                disabled={isBulkUpdating}
                                className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                            >
                                <Lock className="w-3.5 h-3.5" /> Deactivate
                            </button>

                            {/* Dynamic Role Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                    disabled={isBulkUpdating || availableRoles.length === 0}
                                    className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                                >
                                    <UserPlus className="w-3.5 h-3.5" /> Assign Role <ChevronDown className={`w-3 h-3 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isRoleDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-0 mb-4 bg-white text-black rounded-xl shadow-2xl border border-border p-2 min-w-[160px] z-[210] overflow-hidden"
                                        >
                                            <div className="p-2 border-b border-border/50 mb-1">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Select New Role</p>
                                            </div>
                                            <button
                                                onClick={() => bulkUpdateRole('admin')}
                                                className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                            >
                                                <Shield className="w-3.5 h-3.5" /> Administrator
                                            </button>
                                            <button
                                                onClick={() => bulkUpdateRole('customer')}
                                                className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                            >
                                                <UserCircle className="w-3.5 h-3.5" /> Customer
                                            </button>
                                            {availableRoles.map(role => (
                                                <button
                                                    key={role.id}
                                                    onClick={() => bulkUpdateRole(role.name)}
                                                    className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-black hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> {role.name}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={handleBulkDelete}
                                disabled={isBulkUpdating}
                                className="flex items-center gap-2 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                            </button>

                            <button
                                onClick={() => setSelectedIds([])}
                                className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors ml-4"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Customer Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative z-10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Customer</h2>
                                    <p className="text-sm text-muted-foreground font-medium">Manually create a user profile.</p>
                                </div>
                                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleAddCustomer} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter customer name"
                                        className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-black transition-all"
                                        value={newCustomer.name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Identity</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="customer@example.com"
                                        className="w-full bg-muted/30 px-6 py-4 rounded-2xl border-none outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-black transition-all"
                                        value={newCustomer.email}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Initial Access Role</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewCustomer({ ...newCustomer, role: 'admin' })}
                                            className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all
                                                ${newCustomer.role === 'admin' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-border hover:border-black'}`}
                                        >
                                            Administrator
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewCustomer({ ...newCustomer, role: 'customer' })}
                                            className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all
                                                ${newCustomer.role === 'customer' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-border hover:border-black'}`}
                                        >
                                            Customer
                                        </button>
                                        {availableRoles.map(role => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setNewCustomer({ ...newCustomer, role: role.name })}
                                                className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all
                                                    ${newCustomer.role === role.name ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-border hover:border-black'}`}
                                            >
                                                {role.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:shadow-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {isSaving ? "Creating User..." : "Establish User Document"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manage Roles Modal */}
            <AnimatePresence>
                {isManagingRoles && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsManagingRoles(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative z-10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Roles</h2>
                                    <p className="text-sm text-muted-foreground font-medium">Define roles for segmented rewards.</p>
                                </div>
                                <button onClick={() => setIsManagingRoles(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Add Role Form */}
                                <form onSubmit={handleAddRole} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add new role name..."
                                        className="flex-1 bg-muted/30 px-5 py-3 rounded-xl border-none outline-none font-bold text-sm focus:bg-white focus:ring-2 ring-black transition-all"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSavingRole}
                                        className="bg-black text-white px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSavingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                        Add
                                    </button>
                                </form>

                                {/* Roles List */}
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                                    {availableRoles.length === 0 ? (
                                        <p className="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No custom roles defined.</p>
                                    ) : (
                                        availableRoles.map(role => (
                                            <div key={role.id} className="flex justify-between items-center bg-muted/20 p-4 rounded-2xl border border-transparent hover:border-border transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center">
                                                        <Shield className="w-4 h-4 text-black" />
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-900 capitalize">{role.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteRole(role.id)}
                                                    className="p-2 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
