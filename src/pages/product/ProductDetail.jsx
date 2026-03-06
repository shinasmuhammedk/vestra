import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

const API_BASE = "http://localhost:3000";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateWishlistCount } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/products/${id}`);
        setProduct(res.data?.data || null);
      } catch (err) {
        console.error(err);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  /* ================= CHECK IF PRODUCT IS IN WISHLIST ================= */
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !product) return;

      try {
        const token = sessionStorage.getItem("access_token");
        const res = await axios.get(`${API_BASE}/user/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const wishlistItems = res.data?.data || [];
        const isInWishlist = wishlistItems.some(
          (item) => item.product_id === product.id || item.product?.id === product.id
        );
        setIsInWishlist(isInWishlist);
      } catch (err) {
        console.error("Error checking wishlist status:", err);
      }
    };

    checkWishlistStatus();
  }, [user, product]);

  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!user) {
      toast.warn("Please login to add items to cart!");
      navigate("/login");
      return;
    }

    if (product?.sizes && !selectedSize) {
      toast.warn("Please select a size!");
      return;
    }

    try {
      const token = sessionStorage.getItem("access_token");

      const res = await axios.post(
        `${API_BASE}/user/cart`,
        {
          product_id: product.id,
          size: selectedSize,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.status === 200 || res.data?.status === 201) {
        toast.success("Item added to cart!");
      } else {
        toast.error(res.data?.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Cart Error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Error adding item to cart");
    }
  };

  /* ================= TOGGLE WISHLIST ================= */
  const toggleWishlist = async () => {
    if (!user) {
      toast.warn("Please login to add items to wishlist!");
      navigate("/login");
      return;
    }

    if (!product) return;

    setWishlistLoading(true);
    const token = sessionStorage.getItem("access_token");

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const res = await axios.delete(
          `${API_BASE}/user/wishlist/${product.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.status === 200) {
          setIsInWishlist(false);
          updateWishlistCount(prev => Math.max(0, prev - 1));
          toast.success("Removed from wishlist");
        } else {
          toast.error(res.data?.message || "Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const res = await axios.post(
          `${API_BASE}/user/wishlist`,
          {
            product_id: product.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.status === 201 || res.data?.status === 200) {
          setIsInWishlist(true);
          updateWishlistCount(prev => prev + 1);
          toast.success("Added to wishlist!");
        } else {
          toast.error(res.data?.message || "Failed to add to wishlist");
        }
      }
    } catch (err) {
      console.error("Wishlist Error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Error updating wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  /* ================= BUY NOW ================= */
  const handleBuyNow = () => {
    if (!user) {
      toast.warn("Please login to proceed!");
      navigate("/login");
      return;
    }

    navigate(`/buy-now/${product.id}`, {
      state: {
        product,
        selectedSize,
        quantity,
      },
    });
  };

  /* ================= UI STATES ================= */
  if (loading) return <p className="text-center py-12">Loading product...</p>;
  if (!product) return <p className="text-center py-12 text-red-500">Product not found</p>;

  /* ================= HANDLE SIZES ================= */
  const sizesArray = product.sizes
    ? Array.isArray(product.sizes)
      ? product.sizes
      : Object.entries(product.sizes).map(([size, qty]) => ({
          size,
          quantity: qty ?? 0,
        }))
    : [];

  return (
    <div>
      <Navbar />

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* IMAGE SECTION WITH WISHLIST TOGGLE */}
        <div className="relative group">
          {/* Wishlist Floating Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                isInWishlist 
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-red-300" 
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-gray-300"
              } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              {/* Heart Icon using Tailwind */}
              <div className="w-6 h-6">
                {isInWishlist ? (
                  <div className="w-full h-full">
                    {/* Filled Heart */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                      className="w-full h-full"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-full h-full">
                    {/* Outline Heart */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor"
                      className="w-full h-full"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>
          
          {/* Product Image */}
          <img
            src={product.image_url || product.image || "/fallback.jpg"}
            alt={product.name}
            className="w-full h-auto max-h-[500px] object-contain rounded-2xl shadow-lg transition-transform duration-300 group-hover:shadow-xl"
          />
        </div>

        {/* DETAILS */}
        <div className="space-y-6">
          {/* Product Title and Wishlist Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {product.league || "N/A"}
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {product.kit_type || product.kit || "Kit"}
                </span>
              </div>
            </div>
            
            {/* Desktop Wishlist Button */}
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isInWishlist 
                  ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""} min-w-[160px]`}
            >
              <div className="w-5 h-5">
                {isInWishlist ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )}
              </div>
              <span className="font-medium">
                {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
              </span>
            </button>
          </div>

          {/* Year and Price */}
          <div className="space-y-2">
            <p className="text-gray-500">
              <span className="font-medium">Year:</span> {product.year || "N/A"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl lg:text-4xl font-bold text-rose-600">
                ₹{product.price}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₹{Math.round(product.price * 1.2)}
              </span>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                Save 20%
              </span>
            </div>
          </div>

          {/* SIZE SELECTION */}
          {sizesArray.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-gray-900">Select Size</h2>
                <span className="text-sm text-gray-500">
                  {selectedSize ? `Selected: ${selectedSize}` : "Select a size"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizesArray.map(({ size, quantity: sizeQty }) => (
                  <button
                    key={size}
                    disabled={sizeQty === 0}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 border rounded-lg transition-all duration-200 min-w-[60px] ${
                      selectedSize === size 
                        ? "bg-green-500 text-white border-green-500 shadow-md" 
                        : sizeQty === 0
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700 hover:shadow-sm"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium">{size}</div>
                      <div className={`text-xs ${sizeQty === 0 ? "text-gray-400" : "text-gray-500"}`}>
                        {sizeQty === 0 ? "Out of stock" : `${sizeQty} left`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="space-y-3">
            <h2 className="font-semibold text-lg text-gray-900">Quantity</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <span className="text-lg font-bold">−</span>
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-16 px-2 py-2 text-center border-0 focus:ring-0 focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <span className="text-lg font-bold">+</span>
                </button>
              </div>
              <span className="text-sm text-gray-500">
                Only {product.stock || 10} items left
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={(!selectedSize && sizesArray.length > 0) || wishlistLoading}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                (!selectedSize && sizesArray.length > 0) || wishlistLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </div>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={(!selectedSize && sizesArray.length > 0) || wishlistLoading}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                (!selectedSize && sizesArray.length > 0) || wishlistLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Buy Now
              </div>
            </button>
          </div>

          {/* Mobile Wishlist Button (Hidden on desktop) */}
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`md:hidden flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg transition-all duration-300 ${
              isInWishlist 
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="w-5 h-5">
              {isInWishlist ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              )}
            </div>
            <span className="font-medium">
              {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            </span>
          </button>

          {/* PRODUCT DESCRIPTION */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-xl text-gray-900 mb-4">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium">League:</span> {product.league || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Kit Type:</span> {product.kit_type || product.kit || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Year:</span> {product.year || "N/A"}
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2.5 py-1 rounded-full text-sm font-medium ${
                  product.is_active 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {product.is_active ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>

          {/* SHIPPING INFO */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-800">Free Delivery</h4>
                <p className="text-sm text-blue-600">Free shipping on orders above ₹999</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ProductDetail;