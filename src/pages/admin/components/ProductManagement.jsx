import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Star,
    X,
    Package,
    AlertCircle,
    CheckCircle,
    Loader2,
    Search,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Filter,
    ArrowUpRight,
    TrendingUp,
    Image as ImageIcon,
    Shield,
    Sparkles,
    Layers,
    DollarSign,
    Archive,
    MoreHorizontal,
    Eye
} from "lucide-react";
import axios from "axios";

/* ======================
   AXIOS INSTANCE
   ====================== */
const api = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ======================
   HELPERS
   ====================== */
const emptySizes = {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    "2XL": 0,
};

const sizesObjectToArray = (sizes) =>
    Object.entries(sizes)
        .filter(([_, qty]) => qty > 0)
        .map(([size, quantity]) => ({ size, quantity }));

const sizesArrayToObject = (sizes = []) => {
    const obj = { ...emptySizes };
    sizes.forEach((s) => {
        obj[s.size] = s.quantity;
    });
    return obj;
};

/* ======================
   COMPONENT
   ====================== */
const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const [form, setForm] = useState({
        name: "",
        price: 0,
        image: "",
        league: "Premier League",
        kit: "",
        year: new Date().getFullYear(),
        topSelling: false,
        sizes: emptySizes,
    });

    const leagues = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1", "Champions League", "National Teams"];
    const kitTypes = ["Home", "Away", "Third", "Goalkeeper", "Training", "Retro"];

    /* ======================
       FETCH PRODUCTS
       ====================== */
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/products");
            setProducts(res.data.data);
            setFilteredProducts(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch products");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    /* ======================
       SEARCH & FILTER
       ====================== */
    useEffect(() => {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.league.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.kit_type.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const handleSort = useCallback((key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }

        const sorted = [...filteredProducts].sort((a, b) => {
            if (a[key] < b[key]) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setFilteredProducts(sorted);
        setSortConfig({ key, direction });
    }, [filteredProducts, sortConfig]);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchProducts();
    }, [fetchProducts]);

    /* ======================
       FORM HANDLERS
       ====================== */
    const openAdd = useCallback(() => {
        setEditingProduct(null);
        setForm({
            name: "",
            price: 0,
            image: "",
            league: "Premier League",
            kit: "",
            year: new Date().getFullYear(),
            topSelling: false,
            sizes: emptySizes,
        });
        setShowForm(true);
    }, []);

    const openEdit = useCallback((p) => {
        setEditingProduct(p);
        setForm({
            name: p.name,
            price: p.price,
            image: p.image_url,
            league: p.league,
            kit: p.kit_type,
            year: p.year,
            topSelling: p.is_top_selling,
            sizes: sizesArrayToObject(p.sizes),
        });
        setShowForm(true);
    }, []);

    /* ======================
       CREATE / UPDATE
       ====================== */
    const submitForm = useCallback(async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const payload = {
            name: form.name,
            price: form.price,
            image_url: form.image,
            league: form.league,
            kit_type: form.kit,
            year: form.year,
            is_top_selling: form.topSelling,
            sizes: sizesObjectToArray(form.sizes),
        };

        try {
            if (editingProduct) {
                await api.patch(`/admin/products/${editingProduct.id}`, payload);
                setSuccess("Product updated successfully!");
            } else {
                await api.post("/admin/products", payload);
                setSuccess("Product added successfully!");
            }
            setShowForm(false);
            fetchProducts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save product");
        }
    }, [form, editingProduct, fetchProducts]);

    /* ======================
       DELETE
       ====================== */
    const deleteProduct = useCallback(async () => {
        try {
            setError(null);
            await api.delete(`/admin/products/${productToDelete.id}`);
            setShowDelete(false);
            setSuccess("Product deleted successfully!");
            fetchProducts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete product");
        }
    }, [productToDelete, fetchProducts]);

    /* ======================
       TOGGLE TOP SELLING
       ====================== */
    const toggleTopSelling = useCallback(async (p) => {
        try {
            setError(null);
            await api.put(`/products/${p.id}`, {
                is_top_selling: !p.is_top_selling,
            });
            setSuccess(`Product ${!p.is_top_selling ? 'marked as' : 'removed from'} top selling!`);
            fetchProducts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update product");
        }
    }, [fetchProducts]);

    /* ======================
       STATS
       ====================== */
    const stats = useMemo(() => {
        const total = products.length;
        const featured = products.filter(p => p.is_top_selling).length;
        const totalStock = products.reduce((total, p) => 
            total + p.sizes.reduce((sum, s) => sum + s.quantity, 0), 0
        );
        const avgPrice = total > 0 ? products.reduce((sum, p) => sum + p.price, 0) / total : 0;
        return { total, featured, totalStock, avgPrice };
    }, [products]);

    /* ======================
       RENDER HELPERS
       ====================== */
    const getLeagueColor = (league) => {
        const colors = {
            "Premier League": "bg-purple-100 text-purple-700 border-purple-200",
            "La Liga": "bg-orange-100 text-orange-700 border-orange-200",
            "Serie A": "bg-blue-100 text-blue-700 border-blue-200",
            "Bundesliga": "bg-red-100 text-red-700 border-red-200",
            "Ligue 1": "bg-indigo-100 text-indigo-700 border-indigo-200",
            "Champions League": "bg-yellow-100 text-yellow-700 border-yellow-200",
            "National Teams": "bg-green-100 text-green-700 border-green-200",
        };
        return colors[league] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const getKitIcon = (kitType) => {
        if (kitType === 'Home') return <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />;
        if (kitType === 'Away') return <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />;
        if (kitType === 'Third') return <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />;
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
                                    <Package className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Product Management
                                    </h1>
                                </div>
                            </div>
                            <p className="text-gray-500 ml-16 font-medium">
                                Manage your football jersey inventory and product details
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleRefresh} 
                                disabled={isRefreshing}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
                            >
                                <Loader2 className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <button
                                onClick={openAdd}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <Plus className="w-5 h-5" /> Add Product
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                        {loading ? (
                            [1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                                        </div>
                                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                                            <Archive className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            +12% this month
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>

                                <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600 group-hover:scale-110 transition-transform">
                                            <Star className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                            Featured
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Top Selling</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.featured}</p>
                                </div>

                                <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                                            <Layers className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Total Stock</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalStock.toLocaleString()}</p>
                                </div>

                                <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Avg. Price</p>
                                    <p className="text-3xl font-bold text-gray-900">₹{Math.round(stats.avgPrice).toLocaleString()}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Search & View Toggle */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
                        <div className="flex flex-col lg:flex-row gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search products by name, league, or kit type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                                />
                            </div>
                            <div className="flex items-center gap-2 p-2">
                                <div className="flex bg-gray-100 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        List
                                    </button>
                                </div>
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm("")}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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

                {/* Products Display */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center p-16">
                            <div className="text-center">
                                <div className="relative w-16 h-16 mx-auto mb-4">
                                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <p className="text-gray-600 font-medium">Loading products...</p>
                            </div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                {searchTerm 
                                    ? "Try adjusting your search terms to find what you're looking for." 
                                    : "Get started by adding your first football jersey to the inventory."}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={openAdd}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all inline-flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add First Product
                                </button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((p, index) => (
                                <div 
                                    key={p.id} 
                                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fadeIn"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                        <img 
                                            src={p.image_url} 
                                            alt={p.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
                                            }}
                                        />
                                        {p.is_top_selling && (
                                            <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                                                <Star className="w-3 h-3 fill-current" /> TOP
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    className="p-2 bg-white text-blue-600 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleTopSelling(p)}
                                                    className={`p-2 rounded-full shadow-lg hover:scale-110 transition-transform ${p.is_top_selling ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600'}`}
                                                >
                                                    <Star className={`w-4 h-4 ${p.is_top_selling ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getLeagueColor(p.league)}`}>
                                                {p.league}
                                            </span>
                                            <span className="text-lg font-bold text-gray-900">₹{p.price.toLocaleString()}</span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {p.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                            {getKitIcon(p.kit_type)}
                                            {p.kit_type} • {p.year}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {p.sizes.filter(s => s.quantity > 0).slice(0, 4).map(s => (
                                                <span 
                                                    key={s.size}
                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md font-medium"
                                                >
                                                    {s.size}: {s.quantity}
                                                </span>
                                            ))}
                                            {p.sizes.filter(s => s.quantity > 0).length > 4 && (
                                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-md">
                                                    +{p.sizes.filter(s => s.quantity > 0).length - 4} more
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEdit(p)}
                                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit className="w-4 h-4" /> Edit
                                            </button>
                                            <button
                                                onClick={() => { setProductToDelete(p); setShowDelete(true); }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* List View */
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/80 border-b border-gray-200">
                                    <tr>
                                        {[
                                            { label: 'Product', key: 'name' },
                                            { label: 'League', key: 'league' },
                                            { label: 'Kit', key: null },
                                            { label: 'Price', key: 'price' },
                                            { label: 'Stock', key: null },
                                            { label: 'Featured', key: null },
                                            { label: 'Actions', key: null },
                                        ].map(({ label, key }) => (
                                            <th 
                                                key={label} 
                                                className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider"
                                            >
                                                {key ? (
                                                    <button 
                                                        onClick={() => handleSort(key)} 
                                                        className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                                                    >
                                                        {label}
                                                        {sortConfig.key === key && (
                                                            sortConfig.direction === 'ascending' ? 
                                                            <ChevronUp className="w-4 h-4" /> : 
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                ) : label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((p, index) => (
                                        <tr 
                                            key={p.id} 
                                            className="hover:bg-blue-50/30 transition-colors group animate-fadeIn"
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-colors">
                                                        <img 
                                                            src={p.image_url} 
                                                            alt={p.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                                                        <p className="text-sm text-gray-500">{p.year}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${getLeagueColor(p.league)}`}>
                                                    {p.league}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center text-sm font-medium text-gray-700">
                                                    {getKitIcon(p.kit_type)}
                                                    {p.kit_type}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-lg font-bold text-gray-900">₹{p.price.toLocaleString()}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1 max-w-[140px]">
                                                    {p.sizes.filter(s => s.quantity > 0).map(s => (
                                                        <span 
                                                            key={s.size}
                                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md font-medium"
                                                        >
                                                            {s.size}: {s.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <button 
                                                    onClick={() => toggleTopSelling(p)}
                                                    className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                                                        p.is_top_selling 
                                                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                                                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <Star className={`w-5 h-5 ${p.is_top_selling ? 'fill-current' : ''}`} />
                                                </button>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openEdit(p)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit product"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setProductToDelete(p); setShowDelete(true); }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete product"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <a 
                                                        href={p.image_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View image"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Summary Footer */}
                    {filteredProducts.length > 0 && (
                        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                                <div className="flex items-center gap-6">
                                    <span className="text-gray-600">
                                        Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{' '}
                                        <span className="font-semibold text-gray-900">{products.length}</span> products
                                    </span>
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm("")}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span className="font-semibold text-gray-900">{stats.featured}</span> featured
                                    </span>
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <Layers className="w-4 h-4 text-emerald-500" />
                                        <span className="font-semibold text-gray-900">{stats.totalStock.toLocaleString()}</span> items in stock
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD / EDIT MODAL */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${editingProduct ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    {editingProduct ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="p-8 space-y-8">
                            {/* Image Preview */}
                            {form.image && (
                                <div className="flex justify-center">
                                    <div className="relative w-40 h-40 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-inner group">
                                        <img 
                                            src={form.image} 
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
                                        placeholder="e.g., Manchester United Home Jersey 2024"
                                        required
                                    />
                                </div>

                                {/* Price & Year */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                                        <input
                                            type="number"
                                            value={form.price}
                                            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Year <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={form.year}
                                        onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                                        min="2000"
                                        max={new Date().getFullYear() + 2}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>

                                {/* Image URL */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Image URL <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="url"
                                            value={form.image}
                                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
                                            placeholder="https://example.com/image.jpg"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* League & Kit Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        League <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.league}
                                        onChange={(e) => setForm({ ...form, league: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    >
                                        {leagues.map(league => (
                                            <option key={league} value={league}>{league}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Kit Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.kit}
                                        onChange={(e) => setForm({ ...form, kit: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    >
                                        {kitTypes.map(kit => (
                                            <option key={kit} value={kit}>{kit}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Top Selling Toggle */}
                            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        id="topSelling"
                                        checked={form.topSelling}
                                        onChange={(e) => setForm({ ...form, topSelling: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <label
                                        htmlFor="topSelling"
                                        className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500 cursor-pointer"
                                    ></label>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="topSelling" className="text-sm font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                                        <Star className={`w-4 h-4 ${form.topSelling ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                                        Mark as Top Selling
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">Featured prominently on the homepage</p>
                                </div>
                            </div>

                            {/* Sizes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> Stock Quantity by Size
                                </label>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                    {Object.keys(emptySizes).map((size) => (
                                        <div key={size} className="space-y-2">
                                            <label className="block text-xs font-bold text-gray-500 text-center uppercase tracking-wider">
                                                {size}
                                            </label>
                                            <input
                                                type="number"
                                                value={form.sizes[size]}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        sizes: {
                                                            ...form.sizes,
                                                            [size]: Math.max(0, Number(e.target.value)),
                                                        },
                                                    })
                                                }
                                                min="0"
                                                className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-semibold focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
                                                placeholder="0"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-6 py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    {editingProduct ? (
                                        <><Edit className="w-5 h-5" /> Update Product</>
                                    ) : (
                                        <><Plus className="w-5 h-5" /> Create Product</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {showDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slideUp">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Delete Product
                            </h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Are you sure you want to permanently delete <span className="font-semibold text-gray-900">{productToDelete?.name}</span>? 
                                This action cannot be undone and all associated data will be lost.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDelete(false)}
                                    className="flex-1 px-6 py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={deleteProduct}
                                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/25 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5" /> Delete Product
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
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default ProductManagement;