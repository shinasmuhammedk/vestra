import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaShoppingBag,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaCreditCard,
  FaBoxOpen,
  FaUndo,
  FaStar,
  FaFilter,
  FaSortAmountDown,
  FaCalendarAlt,
  FaEye
} from "react-icons/fa";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  RefreshCw,
  Star,
  Filter,
  Calendar,
  Eye,
  ChevronRight,
  ArrowRight,
  Download,
  Printer,
  MessageSquare,
  Shield
} from "lucide-react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

const API_URL = "http://localhost:3000";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const navigate = useNavigate();

  const token = sessionStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/user/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const statusStyle = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DELIVERED":
        return "bg-green-50 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "PLACED":
        return <Clock className="w-4 h-4" />;
      case "SHIPPED":
        return <Truck className="w-4 h-4" />;
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PLACED":
        return { text: "Order Placed", color: "text-yellow-600", bg: "bg-yellow-100" };
      case "SHIPPED":
        return { text: "Shipped", color: "text-blue-600", bg: "bg-blue-100" };
      case "DELIVERED":
        return { text: "Delivered", color: "text-green-600", bg: "bg-green-100" };
      case "CANCELLED":
        return { text: "Cancelled", color: "text-red-600", bg: "bg-red-100" };
      default:
        return { text: status, color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  const filteredOrders = selectedStatus === "ALL" 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const statusFilters = [
    { value: "ALL", label: "All Orders", count: orders.length },
    { value: "PLACED", label: "Placed", count: orders.filter(o => o.status === "PLACED").length },
    { value: "SHIPPED", label: "Shipped", count: orders.filter(o => o.status === "SHIPPED").length },
    { value: "DELIVERED", label: "Delivered", count: orders.filter(o => o.status === "DELIVERED").length },
    { value: "CANCELLED", label: "Cancelled", count: orders.filter(o => o.status === "CANCELLED").length },
  ];

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
              <Package className="w-full h-full" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Please sign in to view your order history and track your purchases.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">
              Track, manage, and review all your purchases
            </p>
          </div>

          <div className="flex gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Package className="w-4 h-4" />
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{orders.reduce((sum, order) => sum + order.total, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === "DELIVERED").length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  selectedStatus === filter.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <span>{filter.label}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  selectedStatus === filter.value
                    ? "bg-white/20"
                    : "bg-gray-100"
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <Package className="w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {selectedStatus === "ALL" ? "No orders yet" : "No orders found"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {selectedStatus === "ALL"
                ? "You haven't placed any orders yet. Start shopping to add items to your order history."
                : `You don't have any ${selectedStatus.toLowerCase()} orders.`}
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Package className="w-5 h-5" />
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color}`}>
                            <span className="flex items-center gap-1.5">
                              {statusIcon(order.status)}
                              {statusBadge.text}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div 
                            className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                            onClick={() => navigate(`/product/${item.product.id}`)}
                          >
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h4
                                  className="font-medium text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                                  onClick={() => navigate(`/product/${item.product.id}`)}
                                >
                                  {item.product.name}
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    Size: {item.size}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">
                                  ₹{item.price * item.quantity}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ₹{item.price} each
                                </div>
                              </div>
                            </div>

                            {/* Actions for delivered items */}
                            {order.status === "DELIVERED" && (
                              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                                <button className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                  <Star className="w-4 h-4" />
                                  Rate Product
                                </button>
                                <button className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                  <MessageSquare className="w-4 h-4" />
                                  Write Review
                                </button>
                                <button className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium ml-auto">
                                  <RefreshCw className="w-4 h-4" />
                                  Buy Again
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>Shipping to: {order.shipping_address || "Your Address"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CreditCard className="w-4 h-4" />
                          <span>Payment: {order.payment_method || "Credit Card"} • {order.payment_status || "Paid"}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Order Total</div>
                        <div className="text-2xl font-bold text-gray-900">₹{order.total}</div>
                        <div className="text-sm text-gray-500">Including all taxes & shipping</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        {orders.length > 0 && (
          <div className="mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Track Your Order</h4>
                        <p className="text-sm text-gray-600">Real-time tracking for shipped orders</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RefreshCw className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Returns & Exchange</h4>
                        <p className="text-sm text-gray-600">30-day easy return policy</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:text-right">
                  <p className="text-gray-600 mb-4">Questions about your order?</p>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                    <MessageSquare className="w-5 h-5" />
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Orders;