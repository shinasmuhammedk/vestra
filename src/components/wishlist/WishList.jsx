import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  Package,
  AlertCircle,
  Eye,
  Star,
  Truck,
  Shield,
  CreditCard,
  ChevronRight,
  Tag
} from "lucide-react";

import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

function Wishlist() {
  const { user } = useAuth();
  const { updateWishlistCount } = useWishlist();
  const { updateCartCount } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movingToCart, setMovingToCart] = useState({});
  const [removing, setRemoving] = useState({});
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  const token = sessionStorage.getItem("access_token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  /* ================== FETCH WISHLIST ================== */
  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/user/wishlist`, axiosConfig);
        const items = res.data?.data || [];
        
        // Normalize the data structure
        const normalizedItems = items.map(item => ({
          id: item.id || item.product_id,
          product: {
            id: item.product?.id || item.product_id,
            name: item.product?.name || "Unnamed Product",
            price: item.product?.price || 0,
            image: item.product?.image_url || item.product?.image || "/fallback.jpg",
            league: item.product?.league || "N/A",
            kit_type: item.product?.kit_type || item.product?.kit || "N/A",
            year: item.product?.year || "N/A",
            stock: item.product?.stock || item.product?.quantity || 0,
          }
        }));
        
        setWishlistItems(normalizedItems);
        updateWishlistCount(normalizedItems.length);
      } catch (err) {
        console.error(err.response?.data || err);
        if (err.response?.status === 401) {
          toast.error("Please login to view wishlist");
          navigate("/login");
        } else {
          toast.error("Failed to fetch wishlist");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, token, navigate]);

  /* ================== REMOVE FROM WISHLIST ================== */
  const handleRemove = async (productId) => {
    if (removing[productId]) return;
    
    setRemoving(prev => ({ ...prev, [productId]: true }));
    
    try {
      await axios.delete(`${API_BASE}/user/wishlist/${productId}`, axiosConfig);

      const updated = wishlistItems.filter(item => item.product.id !== productId);
      setWishlistItems(updated);
      updateWishlistCount(updated.length);

      toast.success("Removed from wishlist");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to remove item");
    } finally {
      setRemoving(prev => ({ ...prev, [productId]: false }));
    }
  };

  /* ================== MOVE TO CART ================== */
  const moveToCart = async (item) => {
    const productId = item.product.id;
    if (movingToCart[productId]) return;
    
    setMovingToCart(prev => ({ ...prev, [productId]: true }));
    
    try {
      // Add to cart
      await axios.post(
        `${API_BASE}/user/cart`,
        {
          product_id: productId,
          quantity: 1,
          size: "M", // Default size, you might want to let user select
        },
        axiosConfig
      );

      // Remove from wishlist
      await axios.delete(`${API_BASE}/user/wishlist/${productId}`, axiosConfig);

      const updated = wishlistItems.filter(w => w.product.id !== productId);
      setWishlistItems(updated);
      updateWishlistCount(updated.length);

      // Refresh cart count
      const cartRes = await axios.get(`${API_BASE}/user/cart`, axiosConfig);
      const cartData = cartRes.data?.data || {};
      const items = cartData.Items || cartData.items || [];
      const totalQty = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
      updateCartCount(totalQty);

      toast.success("Moved to cart successfully!");
    } catch (err) {
      console.error("Move to cart error:", err.response?.data || err);
      const errorMsg = err.response?.data?.message || "Failed to move item to cart";
      
      if (err.response?.status === 400 && errorMsg.includes("size")) {
        toast.error("Please select size in product page first");
        navigate(`/product/${productId}`);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setMovingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  /* ================== REMOVE ALL ================== */
  const removeAll = async () => {
    if (wishlistItems.length === 0) return;
    
    if (!window.confirm("Are you sure you want to remove all items from your wishlist?")) {
      return;
    }
    
    try {
      for (const item of wishlistItems) {
        await axios.delete(`${API_BASE}/user/wishlist/${item.product.id}`, axiosConfig);
      }
      
      setWishlistItems([]);
      updateWishlistCount(0);
      toast.success("All items removed from wishlist");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove all items");
    }
  };

  /* ================== MOVE ALL TO CART ================== */
  const moveAllToCart = async () => {
    if (wishlistItems.length === 0) return;
    
    try {
      let successCount = 0;
      for (const item of wishlistItems) {
        try {
          await axios.post(
            `${API_BASE}/user/cart`,
            {
              product_id: item.product.id,
              quantity: 1,
              size: "M",
            },
            axiosConfig
          );
          successCount++;
          
          // Remove from wishlist after successful add to cart
          await axios.delete(`${API_BASE}/user/wishlist/${item.product.id}`, axiosConfig);
        } catch (err) {
          console.error(`Failed to move item ${item.product.id}:`, err);
        }
      }
      
      // Refresh both counts
      const updatedItems = [];
      setWishlistItems(updatedItems);
      updateWishlistCount(0);
      
      const cartRes = await axios.get(`${API_BASE}/user/cart`, axiosConfig);
      const cartData = cartRes.data?.data || {};
      const items = cartData.Items || cartData.items || [];
      const totalQty = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
      updateCartCount(totalQty);
      
      toast.success(`Successfully moved ${successCount} items to cart`);
      navigate("/cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to move items to cart");
    }
  };

  /* ================== CALCULATE TOTALS ================== */
  const totalQuantity = wishlistItems.length;
  const subtotal = wishlistItems.reduce(
    (sum, item) => sum + (item.product.price || 0),
    0
  );
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = subtotal * 0.18;
  const totalPrice = subtotal + shipping + tax;

  /* ================== RENDER LOADING ================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ================== RENDER NOT LOGGED IN ================== */
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
              Please sign in to view your wishlist and save your favorite items.
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

  /* ================== RENDER EMPTY WISHLIST ================== */
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-red-400">
              <Heart className="w-full h-full" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding your favorite football jerseys to your wishlist for easy access later.
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"} saved for later
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
              onClick={removeAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wishlist Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Wishlist Items Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-gray-100 bg-gray-50 text-gray-700 font-medium">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Wishlist Items */}
              <div className="divide-y divide-gray-100">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Product Image & Info */}
                      <div className="flex flex-1 items-start gap-4">
                        <div
                          className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                          onClick={() => navigate(`/product/${item.product.id}`)}
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            <Heart className="w-3 h-3 fill-current" />
                          </div>
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
                            {item.product.year && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                                {item.product.year}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status (Desktop) */}
                      <div className="hidden md:block text-center">
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${
                          item.product.stock > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      {/* Price (Desktop) */}
                      <div className="hidden md:block text-center">
                        <div className="text-xl font-bold text-rose-600">
                          ₹{item.product.price}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-3">
                        {/* Mobile Price */}
                        <div className="md:hidden">
                          <div className="text-lg font-bold text-rose-600">
                            ₹{item.product.price}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                            item.product.stock > 0 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.product.stock > 0 ? "In Stock" : "Out of Stock"}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveToCart(item)}
                            disabled={movingToCart[item.product.id] || item.product.stock <= 0}
                            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              movingToCart[item.product.id] || item.product.stock <= 0
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                            title="Move to Cart"
                          >
                            {movingToCart[item.product.id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                <span className="hidden md:inline">Move to Cart</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleRemove(item.product.id)}
                            disabled={removing[item.product.id]}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            {removing[item.product.id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div className="md:hidden flex gap-3 pt-4 mt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/product/${item.product.id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Banner */}
            <div className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <Heart className="w-6 h-6 text-red-500 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Your Saved Favorites</h3>
                  <p className="text-gray-600">
                    Items in your wishlist are saved for 30 days. Move them to cart before they expire!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Wishlist Summary</h2>

              {/* Summary Items */}
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Items Saved ({totalQuantity})</span>
                  <span className="font-medium">{totalQuantity}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Total</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Potential Savings</span>
                  <span className="font-medium text-green-600">
                    Up to ₹{(subtotal * 0.1).toFixed(0)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Move All to Cart</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Total if moved to cart with shipping & tax
                  </p>
                </div>
              </div>

              {/* Move All Button */}
              <button
                onClick={moveAllToCart}
                className="w-full mt-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Move All to Cart
              </button>

              {/* Quick Stats */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Tag className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">
                    <span className="font-medium">{totalQuantity} items</span> saved
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-sm">Save for up to 30 days</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Wishlist Benefits</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span>Get notified when prices drop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span>Track stock availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <span>Share with friends & family</span>
                  </li>
                </ul>
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
            <h3 className="font-bold text-gray-900 mb-4">Move to Cart Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">
                    Orders over ₹999 qualify for free shipping
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Secure Checkout</p>
                  <p className="text-sm text-gray-600">
                    SSL encrypted payment processing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">
                    30-day hassle-free return policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Wishlist;