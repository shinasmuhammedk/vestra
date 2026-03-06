import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    Package,
    AlertCircle,
    Truck,
    Shield,
    CreditCard
} from "lucide-react";

import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingQuantity, setUpdatingQuantity] = useState({});
    const [removing, setRemoving] = useState({});
    const navigate = useNavigate();
    const { updateCartCount } = useContext(CartContext);
    const { user } = useAuth();

    // =======================
    // FETCH CART
    // =======================
    useEffect(() => {
        const fetchCart = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await api.get("/user/cart");

                // Handle different response structures
                const data = res.data?.data || {};
                const items = data.Items || data.items || [];

                // 🔁 Normalize backend → frontend shape
                const normalized = items.map((item) => ({
                    id: item.id,
                    size: item.size || "M",
                    quantity: item.quantity || 1,
                    product: {
                        id: item.product?.id || item.product_id,
                        name: item.product?.name || "Product",
                        price: item.product?.price || item.price || 0,
                        image_url: item.product?.image_url || item.product?.image || "/fallback.jpg",
                        league: item.product?.league || "N/A",
                        kit_type: item.product?.kit_type || "N/A",
                        stock: item.product?.stock || 10,
                    },
                }));


                setCartItems(normalized);
                updateCartCount(normalized.reduce((acc, i) => acc + i.quantity, 0));
            } catch (err) {
                console.error("Cart fetch error:", err.response?.data || err);
                if (err.response?.status === 401) {
                    toast.error("Please login to view your cart");
                    navigate("/login");
                } else {
                    toast.error("Failed to load cart");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [user, navigate, updateCartCount]);




    // =======================
    // UPDATE QUANTITY
    // =======================
    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        if (updatingQuantity[itemId]) return;

        setUpdatingQuantity(prev => ({ ...prev, [itemId]: true }));

        try {
            const res = await api.put(`/user/cart/${itemId}`, {
                quantity: newQuantity,
            });

            if (res.data?.status === 200) {
                setCartItems(prev =>
                    prev.map(item =>
                        item.id === itemId
                            ? { ...item, quantity: newQuantity }
                            : item
                    )
                );
                updateCartCount(prev => prev - 1 + newQuantity);
                toast.success("Quantity updated");
            }
            console.log("Api resp", res.data)

        } catch (err) {
            console.error("Update quantity error:", err);
            toast.error(err.response?.data?.message || "Failed to update quantity");
        } finally {
            setUpdatingQuantity(prev => ({ ...prev, [itemId]: false }));
        }
    };

    // =======================
    // REMOVE ITEM
    // =======================
    const handleRemove = async (itemId) => {
        if (removing[itemId]) return;

        setRemoving(prev => ({ ...prev, [itemId]: true }));

        try {
            await api.delete(`/user/cart/${itemId}`);
            const updated = cartItems.filter((i) => i.id !== itemId);
            setCartItems(updated);
            updateCartCount(updated.reduce((a, i) => a + i.quantity, 0));
            toast.success("Item removed from cart");
        } catch (err) {
            console.error("Remove error:", err);
            toast.error(err.response?.data?.message || "Failed to remove item");
        } finally {
            setRemoving(prev => ({ ...prev, [itemId]: false }));
        }
    };

    // =======================
    // BUY ALL
    // =======================
    const handleBuyAll = () => {
        if (cartItems.length === 0) {
            toast.warn("Your cart is empty");
            return;
        }

        navigate("/buy-now", {
            state: { products: cartItems, fromCart: true },
        });
    };

    // =======================
    // CLEAR CART
    // =======================
    const clearCart = async () => {
        if (cartItems.length === 0) return;

        if (!window.confirm("Are you sure you want to clear your entire cart?")) {
            return;
        }

        try {
            for (const item of cartItems) {
                await api.delete(`/user/cart/${item.id}`);
            }

            setCartItems([]);
            updateCartCount(0);
            toast.success("Cart cleared successfully");
        } catch (err) {
            console.error("Clear cart error:", err);
            toast.error("Failed to clear cart");
        }
    };

    // =======================
    // TOTALS
    // =======================
    const totalQuantity = cartItems.reduce((a, i) => a + i.quantity, 0);
    const subtotal = cartItems.reduce(
        (a, i) => a + i.quantity * i.product.price,
        0
    );
    const shipping = subtotal > 999 ? 0 : 99;
    const tax = subtotal * 0.18; // 18% GST
    const totalPrice = subtotal + shipping + tax;

    // =======================
    // RENDER LOADING
    // =======================
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your cart...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // =======================
    // RENDER NOT LOGGED IN
    // =======================
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                            <AlertCircle className="w-full h-full" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Please sign in to view your shopping cart and proceed to checkout.
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

    // =======================
    // RENDER EMPTY CART
    // =======================
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-6 text-blue-400">
                            <ShoppingCart className="w-full h-full" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Looks like you haven't added any items to your cart yet. Start shopping to find amazing football jerseys!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate("/products")}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                <Package className="w-5 h-5" />
                                Browse Products
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Go to Homepage
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
                        <p className="text-gray-600">
                            {totalQuantity} {totalQuantity === 1 ? "item" : "items"} in your cart
                        </p>
                    </div>

                    <div className="flex gap-3 mt-4 lg:mt-0">
                        {/* <button
                            onClick={() => navigate("/products")}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Package className="w-4 h-4" />
                            Continue Shopping
                        </button> */}
                        <button
                            onClick={clearCart}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Cart
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Cart Items Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-gray-100 bg-gray-50 text-gray-700 font-medium">
                                <div className="col-span-5">Product</div>
                                <div className="col-span-2 text-center">Size</div>
                                <div className="col-span-3 text-center">Quantity</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>

                            {/* Cart Items */}
                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                                            {/* Product Image & Info */}
                                            <div className="flex flex-1 items-start gap-4">
                                                <div
                                                    className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                                                    onClick={() => navigate(`/product/${item.product.id}`)}
                                                >
                                                    <img
                                                        src={item.product.image_url}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>

                                                <div>
                                                    <h3
                                                        className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                                                        onClick={() => navigate(`/product/${item.product.id}`)}
                                                    >
                                                        {item.product.name}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {item.product.league && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                                {item.product.league}
                                                            </span>
                                                        )}
                                                        {item.product.kit_type && (
                                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                                                                {item.product.kit_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-lg font-bold text-rose-600">
                                                        ₹{item.product.price}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Size (Desktop) */}
                                            <div className="hidden md:block text-center">
                                                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 font-medium rounded-lg">
                                                    {item.size}
                                                </span>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between md:justify-center">
                                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={updatingQuantity[item.id] || item.quantity <= 1}
                                                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-4 py-2 min-w-[50px] text-center font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={updatingQuantity[item.id] || item.quantity >= item.product.stock}
                                                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Mobile Actions */}
                                                <div className="md:hidden ml-4">
                                                    <button
                                                        onClick={() => handleRemove(item.id)}
                                                        disabled={removing[item.id]}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove item"
                                                    >
                                                        {removing[item.id] ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Total Price & Remove (Desktop) */}
                                            <div className="hidden md:flex items-center justify-end gap-4">
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-gray-900">
                                                        ₹{item.product.price * item.quantity}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    disabled={removing[item.id]}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove item"
                                                >
                                                    {removing[item.id] ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Mobile Total */}
                                            <div className="md:hidden flex justify-between items-center pt-4 border-t border-gray-100">
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900">
                                                        ₹{item.product.price * item.quantity}
                                                    </div>
                                                    <div className="text-sm text-gray-500">Size: {item.size}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Promo Banner */}
                        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-full shadow-sm">
                                    <Truck className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Free Shipping</h3>
                                    <p className="text-gray-600">
                                        Get free shipping on orders above ₹999. Add ₹{Math.max(1, 1000 - subtotal)} more to qualify!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            {/* Summary Items */}
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({totalQuantity} items)</span>
                                    <span className="font-medium">₹{subtotal}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (18% GST)</span>
                                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Including all taxes and charges
                                    </p>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleBuyAll}
                                className="w-full mt-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                Proceed to Checkout
                            </button>

                            {/* Security & Payment Info */}
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Shield className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">Secure checkout with SSL encryption</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <CreditCard className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm">Multiple payment methods accepted</span>
                                </div>
                            </div>

                            {/* Return Policy */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="font-medium text-gray-900 mb-2">Return Policy</h4>
                                <p className="text-sm text-gray-600">
                                    Easy 30-day return policy. Full refund if items are unused and in original packaging.
                                </p>
                            </div>
                        </div>

                        {/* Continue Shopping */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => navigate("/products")}
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Shipping Progress */}
                <div className="mt-12">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Shipping Progress</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Free Shipping</p>
                                    <p className="text-sm text-gray-600">
                                        {subtotal >= 999 ? (
                                            <span className="text-green-600">🎉 You've unlocked free shipping!</span>
                                        ) : (
                                            `Add ₹${1000 - subtotal} more to unlock free shipping`
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="w-48">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-500"
                                        style={{ width: `${Math.min(100, (subtotal / 1000) * 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 text-right mt-1">
                                    ₹{subtotal}/₹1000
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Cart;