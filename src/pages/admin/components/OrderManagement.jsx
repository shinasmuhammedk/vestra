import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Package, Truck, CheckCircle, Clock, XCircle, AlertCircle, Search, Filter,
  ChevronDown, ChevronUp, Eye, DollarSign, ShoppingBag, Calendar, User,
  Phone, MapPin, RefreshCw, Download, MoreVertical, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Sparkles, CreditCard, Hash, Mail, Box,
  Send, Ban, RotateCcw, X, FileText, Printer
} from "lucide-react";
import api from "../../../api/api";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statusOptions = [
    { value: "ALL", label: "All Orders", color: "slate", icon: Package },
    { value: "PLACED", label: "Placed", color: "amber", icon: ShoppingBag },
    { value: "PROCESSING", label: "Processing", color: "blue", icon: Clock },
    { value: "SHIPPED", label: "Shipped", color: "indigo", icon: Truck },
    { value: "DELIVERED", label: "Delivered", color: "emerald", icon: CheckCircle },
    { value: "CANCELLED", label: "Cancelled", color: "rose", icon: Ban },
    { value: "REFUNDED", label: "Refunded", color: "pink", icon: RotateCcw }
  ];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data.data);
      setFilteredOrders(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter and sort orders
  useEffect(() => {
    let result = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.id.toLowerCase().includes(term) ||
        order.user?.name?.toLowerCase().includes(term) ||
        order.user?.email?.toLowerCase().includes(term) ||
        order.shipping_address?.city?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(order => order.status === statusFilter);
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      result = result.filter(order => new Date(order.created_at) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      result = result.filter(order => new Date(order.created_at) <= endDate);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, dateRange, sortConfig]);

  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = useCallback(async (orderId, status) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await api.put(`/admin/order/${orderId}/status`, { status });
      setSuccess(`Order status updated to ${status}`);
      await fetchOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update order status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  }, [fetchOrders]);

  const getStatusColor = useCallback((status) => {
    const statusMap = {
      PLACED: "bg-amber-50 text-amber-700 border-amber-200",
      PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
      SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
      DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
      REFUNDED: "bg-pink-50 text-pink-700 border-pink-200"
    };
    return statusMap[status] || "bg-gray-50 text-gray-700 border-gray-200";
  }, []);

  const getStatusIcon = useCallback((status) => {
    const option = statusOptions.find(s => s.value === status);
    const Icon = option?.icon || Package;
    return <Icon size={14} className="flex-shrink-0" />;
  }, []);

  const calculateStats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const today = new Date();
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return (today - orderDate) <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    const pendingOrders = (statusCounts['PLACED'] || 0) + (statusCounts['PROCESSING'] || 0);
    const completedOrders = statusCounts['DELIVERED'] || 0;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusCounts,
      recentOrders,
      pendingOrders,
      completedOrders
    };
  }, [orders]);

  const exportOrders = useCallback(() => {
    const csvContent = [
      ['Order ID', 'Date', 'Customer', 'Total', 'Status', 'Items', 'Shipping City'],
      ...filteredOrders.map(order => [
        order.id,
        new Date(order.created_at).toLocaleDateString(),
        order.user?.name || 'N/A',
        `₹${order.total}`,
        order.status,
        order.items?.length || 0,
        order.shipping_address?.city || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredOrders]);

  // Skeleton component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  const ViewOrderDetails = useCallback(({ order }) => {
    const statusOption = statusOptions.find(s => s.value === order.status);
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start z-10">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-${statusOption?.color}-100 text-${statusOption?.color}-600`}>
                <statusOption.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600" title="Print order">
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Progress Timeline */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center justify-between relative">
                {['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((step, idx) => {
                  const isCompleted = statusOptions.findIndex(s => s.value === order.status) >= idx;
                  const isCurrent = order.status === step;
                  const stepOption = statusOptions.find(s => s.value === step);
                  
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isCompleted 
                          ? `bg-${stepOption.color}-500 text-white shadow-lg shadow-${stepOption.color}-500/30` 
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-' + stepOption.color + '-200 scale-110' : ''}`}>
                        <stepOption.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {stepOption.label}
                      </span>
                      {isCurrent && (
                        <span className="text-xs text-gray-500 mt-1">Current</span>
                      )}
                    </div>
                  );
                })}
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-0 mx-12">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 transition-all"
                    style={{ width: `${Math.min((statusOptions.findIndex(s => s.value === order.status) / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Customer Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" /> Customer Information
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {order.user?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {order.user?.email || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {order.user?.phone || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer ID</p>
                      <p className="font-mono text-sm text-gray-900">{order.user?.id?.slice(0, 12) || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" /> Shipping Address
                  </h4>
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="font-semibold text-gray-900 text-lg mb-2">
                      {order.shipping_address?.address || 'N/A'}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-gray-100 rounded-lg">{order.shipping_address?.city}</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-lg">{order.shipping_address?.state}</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-lg font-mono">{order.shipping_address?.pincode}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Box className="w-5 h-5 text-purple-600" /> 
                    Order Items ({order.items?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product?.image_url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'} 
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">{item.product?.name}</h5>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded-md">Size: {item.size}</span>
                            <span className="px-2 py-1 bg-gray-100 rounded-md">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{item.price?.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">₹{(item.price * item.quantity)?.toLocaleString()} total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="space-y-6">
                <div className="bg-gray-900 text-white rounded-2xl p-6">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Payment Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>Payment Method</span>
                      <span className="text-white capitalize">{order.payment_method || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Payment Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        order.payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.payment_status || 'PENDING'}
                      </span>
                    </div>
                    <div className="h-px bg-gray-700 my-4" />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span>₹{order.subtotal?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping</span>
                      <span>₹{order.shipping_charge?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tax</span>
                      <span>₹{order.tax?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="h-px bg-gray-700 my-4" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-emerald-400">₹{order.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Update Status
                  </h4>
                  <div className="space-y-2">
                    {statusOptions.slice(1).map((status) => (
                      <button
                        key={status.value}
                        onClick={() => updateStatus(order.id, status.value)}
                        disabled={order.status === status.value || actionLoading[order.id]}
                        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-between ${
                          order.status === status.value
                            ? `bg-${status.color}-500 text-white shadow-lg shadow-${status.color}-500/25`
                            : `bg-${status.color}-50 text-${status.color}-700 hover:bg-${status.color}-100`
                        } ${actionLoading[order.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="flex items-center gap-2">
                          <status.icon className="w-4 h-4" />
                          {status.label}
                        </span>
                        {order.status === status.value && <CheckCircle className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracking Info */}
                {order.tracking_number && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                    <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                      <Truck className="w-5 h-5" /> Tracking Info
                    </h4>
                    <p className="font-mono text-indigo-700 bg-white px-3 py-2 rounded-lg border border-indigo-200">
                      {order.tracking_number}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [updateStatus, actionLoading, getStatusColor]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Order Management
                  </h1>
                </div>
              </div>
              <p className="text-gray-500 ml-16 font-medium">Manage and track all customer orders in real-time</p>
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
                onClick={exportOrders} 
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +{calculateStats.recentOrders} this week
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{calculateStats.totalOrders.toLocaleString()}</p>
                </div>

                <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">₹{calculateStats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Avg: ₹{Math.round(calculateStats.avgOrderValue).toLocaleString()}
                  </p>
                </div>

                <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      Needs Action
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{calculateStats.pendingOrders}</p>
                </div>

                <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-rose-100 rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Issues</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(calculateStats.statusCounts['CANCELLED'] || 0) + (calculateStats.statusCounts['REFUNDED'] || 0)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, email, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 p-2">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                  <Filter className="w-4 h-4 text-gray-400 ml-2" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-0 py-2 px-3 pr-8 text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-transparent border-0 py-1 px-2 text-sm text-gray-700 focus:ring-0"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-transparent border-0 py-1 px-2 text-sm text-gray-700 focus:ring-0"
                  />
                </div>
                {(searchTerm || statusFilter !== "ALL" || dateRange.start || dateRange.end) && (
                  <button 
                    onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); setDateRange({ start: "", end: "" }); }}
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
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 animate-slideDown">
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="flex-1 font-medium">{error}</span>
              <button onClick={() => setError(null)} className="p-2 hover:bg-rose-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 animate-slideDown">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="flex-1 font-medium">{success}</span>
              <button onClick={() => setSuccess(null)} className="p-2 hover:bg-emerald-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-16">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading orders...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      {[
                        { label: 'Order ID', key: 'id' },
                        { label: 'Date & Time', key: 'created_at' },
                        { label: 'Customer', key: null },
                        { label: 'Items', key: null },
                        { label: 'Total', key: 'total' },
                        { label: 'Status', key: null },
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
                                sortConfig.direction === 'asc' ? 
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
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                              {searchTerm || statusFilter !== "ALL" || dateRange.start || dateRange.end
                                ? "Try adjusting your search or filter criteria to find what you're looking for."
                                : "No orders have been placed yet. Orders will appear here once customers make purchases."}
                            </p>
                            {(searchTerm || statusFilter !== "ALL" || dateRange.start || dateRange.end) && (
                              <button 
                                onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); setDateRange({ start: "", end: "" }); }}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                              >
                                Clear all filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order, index) => (
                        <tr 
                          key={order.id} 
                          className="hover:bg-blue-50/30 transition-colors group animate-fadeIn"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <Hash className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="font-mono font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {(order.user?.name || 'G').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{order.user?.name || 'Guest'}</p>
                                <p className="text-xs text-gray-500">{order.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-gray-100 rounded-md">
                                <Box className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="font-semibold text-gray-900">{order.items?.length || 0}</span>
                              <span className="text-xs text-gray-500">items</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-lg font-bold text-gray-900">₹{order.total?.toLocaleString()}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                              <select
                                value={order.status}
                                disabled={actionLoading[order.id]}
                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                className={`text-xs border rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                                  actionLoading[order.id] ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {statusOptions.slice(1).map((status) => (
                                  <option key={status.value} value={status.value}>
                                    Mark as {status.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateStatus(order.id, 'DELIVERED')}
                                disabled={actionLoading[order.id] || order.status === 'DELIVERED'}
                                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                                  order.status === 'DELIVERED'
                                    ? 'text-emerald-600 bg-emerald-50 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600'
                                } ${actionLoading[order.id] ? 'opacity-50' : ''}`}
                                title="Quick deliver"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-all">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              {filteredOrders.length > 0 && (
                <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
                    <div className="flex items-center gap-6">
                      <span className="text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span> of{' '}
                        <span className="font-semibold text-gray-900">{orders.length}</span> orders
                      </span>
                      {(searchTerm || statusFilter !== "ALL") && (
                        <button 
                          onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        {statusOptions.slice(1).map((status) => (
                          <div key={status.value} className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full bg-${status.color}-500`}></div>
                            <span className="text-gray-600 text-xs">
                              {calculateStats.statusCounts[status.value] || 0} {status.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && <ViewOrderDetails order={selectedOrder} />}

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

export default OrderManagement;