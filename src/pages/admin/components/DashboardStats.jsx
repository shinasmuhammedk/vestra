import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import api from "../../../api/api";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    revenueChange: 12.5, // Mock data for trend
    ordersChange: 8.2,
    productsChange: -2.1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      if (!isRefreshing) setLoading(true);
      
      const [productsRes, paymentsRes] = await Promise.all([
        api.get("/products"),
        api.get("/admin/payments"),
      ]);

      const products = productsRes.data.data;
      const payments = paymentsRes.data.data;

      const totalRevenue = payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

      setStats(prev => ({
        ...prev,
        totalRevenue,
        totalOrders: payments.length,
        totalProducts: products.length,
      }));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard stats. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-3 w-full">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-red-900 font-semibold">Error Loading Stats</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      trend: stats.revenueChange,
      color: "emerald",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      trend: stats.ordersChange,
      color: "blue",
      bgGradient: "from-blue-500/10 to-indigo-500/10",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      trend: stats.productsChange,
      color: "violet",
      bgGradient: "from-violet-500/10 to-purple-500/10",
      iconBg: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
          title="Refresh stats"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={card.title} {...card} delay={index * 100} />
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, bgGradient, iconBg, delay = 0 }) => {
  const isPositive = trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -mr-16 -mt-16`} />
      
      <div className="relative flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isPositive 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            }`}>
              <TrendIcon size={12} className={isPositive ? "" : "rotate-180"} />
              <span>{isPositive ? "+" : ""}{trend}%</span>
            </div>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        </div>
        
        <div className={`p-3.5 ${iconBg} rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
      
      {/* Bottom progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
        <div 
          className={`h-full bg-gradient-to-r ${bgGradient.replace('/10', '')} opacity-60`} 
          style={{ width: `${Math.min(Math.abs(trend) * 5 + 20, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default DashboardStats;