import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Search, Filter, Trash2, Shield, ShieldOff, Users, AlertCircle, X,
    Mail, Phone, Calendar, CheckCircle, XCircle, MoreVertical, Eye,
    Edit, Download, RefreshCw, UserPlus, TrendingUp, TrendingDown,
    Lock, Unlock, Crown, UserCheck, UserX, ChevronUp, ChevronDown,
    Hash, BarChart3, Globe, UserCog, Key, Clock, CreditCard, Package, Activity,
    Sparkles, ArrowUpRight, ArrowDownRight, Layers, Zap, Ban
} from "lucide-react";
import api from "../../../api/api";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [actionLoading, setActionLoading] = useState({});
    const [deleteUser, setDeleteUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const itemsPerPage = 10;

    const roleOptions = [
        { value: "ALL", label: "All Roles", icon: Users, color: "gray" },
        { value: "admin", label: "Admin", icon: Crown, color: "purple" },
        { value: "user", label: "User", icon: UserCog, color: "blue" },
        { value: "moderator", label: "Moderator", icon: Shield, color: "green" }
    ];

    const statusOptions = [
        { value: "ALL", label: "All Status", icon: Globe, color: "gray" },
        { value: "active", label: "Active", icon: CheckCircle, color: "green" },
        { value: "blocked", label: "Blocked", icon: UserX, color: "red" },
        { value: "inactive", label: "Inactive", icon: Clock, color: "yellow" }
    ];

    /* ======================
       FETCH USERS
       ====================== */
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/admin/users");
            setUsers(res.data.data);
            setFilteredUsers(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load users");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        let result = [...users];

        if (search) {
            const term = search.toLowerCase();
            result = result.filter(user =>
                user.name?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term) ||
                user.phone?.toLowerCase().includes(term)
            );
        }

        if (roleFilter !== "ALL") {
            result = result.filter(user => user.role === roleFilter);
        }

        if (statusFilter !== "ALL") {
            if (statusFilter === "active") {
                result = result.filter(user => !user.is_blocked);
            } else if (statusFilter === "blocked") {
                result = result.filter(user => user.is_blocked);
            } else if (statusFilter === "inactive") {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                result = result.filter(user => {
                    const lastLogin = user.last_login_at ? new Date(user.last_login_at) : null;
                    return lastLogin && lastLogin < thirtyDaysAgo;
                });
            }
        }

        if (sortConfig.key) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (sortConfig.key === 'created_at' || sortConfig.key === 'last_login_at') {
                    return sortConfig.direction === 'asc'
                        ? new Date(aValue) - new Date(bValue)
                        : new Date(bValue) - new Date(aValue);
                }
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredUsers(result);
        setCurrentPage(1);
    }, [users, search, roleFilter, statusFilter, sortConfig]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchUsers();
    }, [fetchUsers]);

    const stats = useMemo(() => {
        const total = users.length;
        const admins = users.filter(u => u.role === 'admin').length;
        const active = users.filter(u => !u.is_blocked).length;
        const blocked = users.filter(u => u.is_blocked).length;
        const moderators = users.filter(u => u.role === 'moderator').length;
        const newUsers = users.filter(u => {
            const createdDate = new Date(u.created_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return createdDate >= sevenDaysAgo;
        }).length;
        
        // Calculate trends (mock data for demo - in real app, compare with previous period)
        const activeTrend = active > 0 ? ((active - Math.floor(active * 0.9)) / Math.floor(active * 0.9) * 100).toFixed(1) : 0;
        const newTrend = newUsers > 0 ? 12.5 : 0;
        
        return { total, admins, active, blocked, moderators, newUsers, activeTrend, newTrend };
    }, [users]);

    /* ======================
       TOGGLE BLOCK
       ====================== */
    const toggleBlock = useCallback(async (user) => {
        setActionLoading(prev => ({ ...prev, [user.id]: true }));
        try {
            await api.put(`/admin/users/${user.id}/block`);
            setUsers(prev =>
                prev.map(u => u.id === user.id ? { ...u, is_blocked: !u.is_blocked } : u)
            );
            setSuccess(`User ${!user.is_blocked ? 'blocked' : 'unblocked'} successfully`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update user");
        } finally {
            setActionLoading(prev => ({ ...prev, [user.id]: false }));
        }
    }, []);

    /* ======================
       DELETE USER
       ====================== */
    const confirmDelete = useCallback(async () => {
        if (!deleteUser) return;
        setActionLoading(prev => ({ ...prev, [deleteUser.id]: true }));
        try {
            await api.delete(`/admin/users/${deleteUser.id}`);
            setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
            setDeleteUser(null);
            setSuccess("User deleted successfully");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete user");
        } finally {
            setActionLoading(prev => ({ ...prev, [deleteUser.id]: false }));
        }
    }, [deleteUser]);

    /* ======================
       EXPORT CSV
       ====================== */
    const exportUsers = useCallback(() => {
        const csvContent = [
            ['Name', 'Email', 'Role', 'Status', 'Joined Date', 'Last Login'],
            ...filteredUsers.map(user => [
                user.name,
                user.email,
                user.role,
                user.is_blocked ? 'Blocked' : 'Active',
                new Date(user.created_at).toLocaleDateString(),
                user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }, [filteredUsers]);

    /* ======================
       USER DETAILS MODAL
       ====================== */
    const UserDetailsModal = useCallback(({ user }) => {
        const activityData = [
            { label: 'Account Age', value: `${Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))} days`, icon: Clock },
            { label: 'Last Login', value: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never', icon: Activity },
            { label: 'Email Status', value: user.email_verified ? 'Verified' : 'Unverified', icon: user.email_verified ? CheckCircle : XCircle, color: user.email_verified ? 'green' : 'yellow' },
        ];

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all animate-slideUp">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-8 py-6 text-white">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-bold border-2 border-white/30 shadow-xl">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{user.name}</h3>
                                    <p className="text-blue-100 flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4" /> {user.email}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Badges */}
                        <div className="relative flex flex-wrap gap-2 mt-4">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/30 flex items-center gap-1.5`}>
                                {user.role === 'admin' ? <Crown className="w-3 h-3" /> : user.role === 'moderator' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                                {user.role?.toUpperCase()}
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border flex items-center gap-1.5 ${
                                user.is_blocked ? 'bg-red-500/80 border-red-400/50' : 'bg-green-500/80 border-green-400/50'
                            }`}>
                                {user.is_blocked ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                {user.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                            </span>
                            {user.email_verified && (
                                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-green-500/80 backdrop-blur-sm border border-green-400/50 flex items-center gap-1.5">
                                    <CheckCircle className="w-3 h-3" /> VERIFIED
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Activity Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            {activityData.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color ? `bg-${item.color}-100 text-${item.color}-600` : 'bg-blue-100 text-blue-600'}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Contact Info */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-500" /> Contact Information
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Email Address</p>
                                        <p className="font-medium text-gray-900">{user.email}</p>
                                    </div>
                                    {user.email_verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone Number</p>
                                            <p className="font-medium text-gray-900">{user.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" /> Quick Actions
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => toggleBlock(user)}
                                    disabled={actionLoading[user.id]}
                                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                                        user.is_blocked
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                                    } ${actionLoading[user.id] ? 'opacity-50 cursor-not-allowed translate-y-0' : ''}`}
                                >
                                    {actionLoading[user.id] ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : user.is_blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    {user.is_blocked ? 'Unblock User' : 'Block User'}
                                </button>
                                <button
                                    onClick={() => { setSelectedUser(null); setDeleteUser(user); }}
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2 hover:shadow-md"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                                <button className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-all flex items-center gap-2 hover:shadow-md">
                                    <Edit className="w-4 h-4" /> Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [toggleBlock, actionLoading]);

    // Skeleton loader component
    const SkeletonCard = () => (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">User Management</h1>
                                </div>
                            </div>
                            <p className="text-gray-500 ml-16 font-medium">Manage user accounts, permissions, and access control</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleRefresh} 
                                disabled={isRefreshing}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <button 
                                onClick={exportUsers} 
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        {loading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : (
                            <>
                                {[
                                    { 
                                        label: 'Total Users', 
                                        value: stats.total, 
                                        icon: Users, 
                                        color: 'blue',
                                        trend: stats.newUsers > 0 ? `+${stats.newUsers} this week` : 'No new users',
                                        trendUp: stats.newUsers > 0,
                                        bgGradient: 'from-blue-500/10 to-cyan-500/10'
                                    },
                                    { 
                                        label: 'Active Users', 
                                        value: stats.active, 
                                        icon: UserCheck, 
                                        color: 'emerald',
                                        trend: `${stats.activeTrend}% vs last month`,
                                        trendUp: stats.activeTrend > 0,
                                        bgGradient: 'from-emerald-500/10 to-teal-500/10'
                                    },
                                    { 
                                        label: 'Admins', 
                                        value: stats.admins, 
                                        icon: Crown, 
                                        color: 'purple',
                                        trend: `${Math.round((stats.admins / (stats.total || 1)) * 100)}% of total`,
                                        bgGradient: 'from-purple-500/10 to-pink-500/10'
                                    },
                                    { 
                                        label: 'Blocked', 
                                        value: stats.blocked, 
                                        icon: UserX, 
                                        color: 'rose',
                                        trend: `${Math.round((stats.blocked / (stats.total || 1)) * 100)}% of total`,
                                        trendUp: false,
                                        bgGradient: 'from-rose-500/10 to-red-500/10'
                                    },
                                ].map(({ label, value, icon: Icon, color, trend, trendUp, bgGradient }) => (
                                    <div key={label} className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -mr-16 -mt-16`} />
                                        <div className="relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 bg-${color}-100 rounded-xl text-${color}-600 group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                {trend && (
                                                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                        {trend}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                                                <p className="text-3xl font-bold text-gray-900 tracking-tight">{value.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-6">
                        <div className="flex flex-col lg:flex-row gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                />
                            </div>
                            <div className="flex items-center gap-2 p-2">
                                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                                    <Filter className="w-4 h-4 text-gray-400 ml-2" />
                                    <select 
                                        value={roleFilter} 
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="bg-transparent border-0 py-2 px-3 pr-8 text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
                                    >
                                        {roleOptions.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                                    <select 
                                        value={statusFilter} 
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-transparent border-0 py-2 px-3 pr-8 text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
                                    >
                                        {statusOptions.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {(search || roleFilter !== "ALL" || statusFilter !== "ALL") && (
                                    <button 
                                        onClick={() => { setSearch(""); setRoleFilter("ALL"); setStatusFilter("ALL"); }}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Clear filters"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                <div className="space-y-3 mb-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-slideDown">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <span className="flex-1 font-medium">{error}</span>
                            <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-slideDown">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <span className="flex-1 font-medium">{success}</span>
                            <button onClick={() => setSuccess(null)} className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center p-16">
                            <div className="text-center">
                                <div className="relative w-16 h-16 mx-auto mb-4">
                                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <p className="text-gray-600 font-medium">Loading users...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/80 border-b border-gray-200">
                                        <tr>
                                            {[ 
                                                { label: 'User', key: 'name', width: '30%' },
                                                { label: 'Role', key: 'role', width: '15%' },
                                                { label: 'Status', key: null, width: '15%' },
                                                { label: 'Joined', key: 'created_at', width: '15%' },
                                                { label: 'Last Active', key: 'last_login_at', width: '15%' },
                                                { label: 'Actions', key: null, width: '10%' },
                                            ].map(({ label, key, width }) => (
                                                <th 
                                                    key={label} 
                                                    style={{ width }}
                                                    className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider"
                                                >
                                                    {key ? (
                                                        <button 
                                                            onClick={() => handleSort(key)} 
                                                            className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                                                        >
                                                            {label}
                                                            <span className={`p-1 rounded transition-colors ${sortConfig.key === key ? 'bg-blue-100 text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                                {sortConfig.key === key ? (
                                                                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                                                ) : <ChevronUp className="w-4 h-4 opacity-0 group-hover:opacity-50" />}
                                                            </span>
                                                        </button>
                                                    ) : label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-16 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                            <Users className="w-10 h-10 text-gray-300" />
                                                        </div>
                                                        <p className="text-lg font-semibold text-gray-900 mb-2">No users found</p>
                                                        <p className="text-sm text-gray-500 max-w-sm">
                                                            {search || roleFilter !== "ALL" || statusFilter !== "ALL"
                                                                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                                                                : 'No users have registered yet. Users will appear here once they sign up.'}
                                                        </p>
                                                        {(search || roleFilter !== "ALL" || statusFilter !== "ALL") && (
                                                            <button 
                                                                onClick={() => { setSearch(""); setRoleFilter("ALL"); setStatusFilter("ALL"); }}
                                                                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                                                            >
                                                                Clear all filters
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedUsers.map((user, index) => (
                                                <tr 
                                                    key={user.id} 
                                                    className="hover:bg-blue-50/30 transition-colors group animate-fadeIn"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform">
                                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                                </div>
                                                                {user.email_verified && (
                                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                                            user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            user.role === 'moderator' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                            {user.role === 'admin' && <Crown className="w-3.5 h-3.5" />}
                                                            {user.role === 'moderator' && <Shield className="w-3.5 h-3.5" />}
                                                            {user.role === 'user' && <UserCog className="w-3.5 h-3.5" />}
                                                            {user.role?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                                            user.is_blocked 
                                                                ? 'bg-red-50 text-red-700 border-red-200' 
                                                                : 'bg-green-50 text-green-700 border-green-200'
                                                        }`}>
                                                            {user.is_blocked ? (
                                                                <><Ban className="w-3.5 h-3.5" /> BLOCKED</>
                                                            ) : (
                                                                <><CheckCircle className="w-3.5 h-3.5" /> ACTIVE</>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="text-sm">
                                                            <p className="font-medium text-gray-900">
                                                                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))} days ago
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {user.last_login_at ? (
                                                            <div className="text-sm">
                                                                <p className="font-medium text-gray-900">
                                                                    {new Date(user.last_login_at).toLocaleDateString()}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {new Date(user.last_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                                                <Clock className="w-3 h-3" /> Never
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-1">
                                                            <button 
                                                                onClick={() => setSelectedUser(user)} 
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110" 
                                                                title="View details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleBlock(user)}
                                                                disabled={actionLoading[user.id]}
                                                                className={`p-2 rounded-lg transition-all hover:scale-110 ${actionLoading[user.id] ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'} ${user.is_blocked ? 'text-green-600' : 'text-amber-600'}`}
                                                                title={user.is_blocked ? "Unblock user" : "Block user"}
                                                            >
                                                                {actionLoading[user.id] ? (
                                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                ) : user.is_blocked ? (
                                                                    <Unlock className="w-4 h-4" />
                                                                ) : (
                                                                    <Lock className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            {user.role !== 'admin' && (
                                                                <button 
                                                                    onClick={() => setDeleteUser(user)} 
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110" 
                                                                    title="Delete user"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {filteredUsers.length > itemsPerPage && (
                                <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing <span className="font-semibold text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)}</span> to{' '}
                                        <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of{' '}
                                        <span className="font-semibold text-gray-900">{filteredUsers.length.toLocaleString()}</span> users
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-gray-400 transition-all"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) pageNum = i + 1;
                                                else if (currentPage <= 3) pageNum = i + 1;
                                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                                else pageNum = currentPage - 2 + i;
                                                return (
                                                    <button 
                                                        key={i} 
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                                                            currentPage === pageNum 
                                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                                                                : 'text-gray-700 hover:bg-white hover:shadow-sm'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-gray-400 transition-all"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Footer Summary */}
                            {filteredUsers.length > 0 && !loading && (
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                                    <div className="flex items-center gap-4">
                                        {[
                                            { color: 'blue', label: `${stats.active.toLocaleString()} active`, icon: CheckCircle },
                                            { color: 'purple', label: `${stats.admins.toLocaleString()} admins`, icon: Crown },
                                            { color: 'green', label: `${stats.moderators.toLocaleString()} moderators`, icon: Shield },
                                            { color: 'rose', label: `${stats.blocked.toLocaleString()} blocked`, icon: Ban },
                                        ].map(({ color, label, icon: Icon }) => (
                                            <div key={label} className="flex items-center gap-1.5 font-medium text-gray-600">
                                                <div className={`p-1 rounded-md bg-${color}-100`}>
                                                    <Icon className={`w-3 h-3 text-${color}-600`} />
                                                </div>
                                                <span>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Layers className="w-4 h-4" />
                                        <span className="font-medium">Total: {stats.total.toLocaleString()} users</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {selectedUser && <UserDetailsModal user={selectedUser} />}

            {deleteUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all animate-slideUp">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete User Account</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Are you sure you want to permanently delete <span className="font-semibold text-gray-900">{deleteUser.name}</span>? 
                                This action cannot be undone and all associated data will be lost.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteUser(null)} 
                                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete} 
                                    disabled={actionLoading[deleteUser.id]}
                                    className={`flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/25 hover:shadow-xl ${
                                        actionLoading[deleteUser.id] ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'
                                    }`}
                                >
                                    {actionLoading[deleteUser.id] ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Deleting...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Trash2 className="w-5 h-5" /> Delete User
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { 
                    from { opacity: 0; } 
                    to { opacity: 1; } 
                }
                @keyframes slideUp { 
                    from { opacity: 0; transform: translateY(20px) scale(0.95); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
                @keyframes slideDown { 
                    from { opacity: 0; transform: translateY(-10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
                .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default UserManagement;