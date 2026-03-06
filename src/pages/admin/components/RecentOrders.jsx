import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle, AlertCircle, Package } from "lucide-react";
import api from "../../../api/api";

const RecentOrders = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/orders");
      const orders = res.data.data || res.data;

      const sortedOrders = [...orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3);

      setRecentOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      setError("Failed to load recent orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":   return <CheckCircle size={16} className="text-green-500" />;
      case "pending":     return <Clock size={16} className="text-yellow-500" />;
      case "cancelled":   return <XCircle size={16} className="text-red-500" />;
      default:            return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":   return "bg-green-100 text-green-800";
      case "pending":     return "bg-yellow-100 text-yellow-800";
      case "cancelled":   return "bg-red-100 text-red-800";
      default:            return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return isNaN(date) ? "—" : date.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const getItemCount = (order) =>
    (order.items || order.products || []).reduce(
      (sum, i) => sum + (Number(i.quantity) || 1), 0
    );

  const getAmount = (order) =>
    (order.total_amount ?? order.totalAmount ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const headers = ["Order ID", "Customer", "Date", "Items", "Amount", "Status"];

  const SkeletonRows = () => (
    <>
      {[...Array(3)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="py-4"><div className="w-16 h-4 bg-gray-200 rounded" /></td>
          <td className="py-4 space-y-2">
            <div className="w-32 h-4 bg-gray-200 rounded" />
            <div className="w-48 h-3 bg-gray-200 rounded" />
          </td>
          <td className="py-4"><div className="w-24 h-4 bg-gray-200 rounded" /></td>
          <td className="py-4"><div className="w-16 h-4 bg-gray-200 rounded" /></td>
          <td className="py-4"><div className="w-20 h-4 bg-gray-200 rounded" /></td>
          <td className="py-4"><div className="w-24 h-4 bg-gray-200 rounded" /></td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-full mx-auto transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="text-blue-500" size={20} />
          Recent Orders
        </h3>
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2 text-red-600 py-8">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {headers.map((h) => (
                  <th key={h} className="text-left py-3 text-sm font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <SkeletonRows />
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <tr key={order.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-sm font-semibold text-gray-900">
                      #{String(order.id || index + 1).slice(0, 8)}
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-semibold text-gray-900 block">
                        {order.user?.name || order.customerName || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {order.user?.email || order.customerEmail || "—"}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {formatDate(order.created_at || order.orderDate)}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {getItemCount(order)} items
                    </td>
                    <td className="py-4 text-sm font-semibold text-gray-900">
                      ₹{getAmount(order)}
                    </td>
                    <td className="py-4">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status
                          ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                          : "Pending"}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-600">
                    No orders available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;