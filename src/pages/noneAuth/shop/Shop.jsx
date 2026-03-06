import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Heart } from "lucide-react";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import FilterSection from "./FilterSection";
import Pagination from "./Pagination";
import { useAuth } from "../../../context/AuthContext";
import { useWishlist } from "../../../context/WishlistContext";

const API_BASE = "http://localhost:3000";

function Shop() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [wishlistStatus, setWishlistStatus] = useState({}); // Track wishlist status per product

    const [searchName, setSearchName] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedKit, setSelectedKit] = useState("");
    const [selectedLeague, setSelectedLeague] = useState("");
    const [sortOption, setSortOption] = useState("year-desc");

    const [availableYears, setAvailableYears] = useState([]);
    const [availableLeagues, setAvailableLeagues] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistLoading, setWishlistLoading] = useState({}); // Track loading per product

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const navigate = useNavigate();
    const { user } = useAuth();
    const { updateWishlistCount } = useWishlist();

    /* ========================
       FETCH PRODUCTS
       ======================== */
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_BASE}/products`);
                const data = res.data?.data || [];

                setProducts(data);
                setFilteredProducts(data);

                setAvailableYears(
                    [...new Set(data.map(p => p.year).filter(Boolean))].sort((a, b) => b - a)
                );

                setAvailableLeagues(
                    [...new Set(data.map(p => p.league).filter(Boolean))].sort()
                );
            } catch (err) {
                console.error(err);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    /* ========================
       FETCH WISHLIST STATUS FOR LOGGED IN USERS
       ======================== */
    useEffect(() => {
        const fetchWishlistStatus = async () => {
            if (!user) {
                // Clear wishlist status if user logs out
                setWishlistStatus({});
                return;
            }

            try {
                const token = sessionStorage.getItem("access_token");
                const res = await axios.get(`${API_BASE}/user/wishlist`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const wishlistItems = res.data?.data || [];

                // Create a map of product IDs that are in the wishlist
                const statusMap = {};
                wishlistItems.forEach(item => {
                    const productId = item.product_id || item.product?.id;
                    if (productId) {
                        statusMap[productId] = true;
                    }
                });

                setWishlistStatus(statusMap);
            } catch (err) {
                console.error("Error fetching wishlist status:", err);
            }
        };

        fetchWishlistStatus();
    }, [user]);

    /* ========================
       TOGGLE WISHLIST FUNCTION
       ======================== */
    const toggleWishlist = useCallback(async (productId, e) => {
        e.stopPropagation(); // Prevent navigation to product detail

        if (!user) {
            navigate("/login");
            return;
        }

        // Prevent double clicks
        if (wishlistLoading[productId]) return;

        setWishlistLoading(prev => ({ ...prev, [productId]: true }));
        const token = sessionStorage.getItem("access_token");
        const isCurrentlyInWishlist = wishlistStatus[productId];

        try {
            if (isCurrentlyInWishlist) {
                // Remove from wishlist
                const res = await axios.delete(
                    `${API_BASE}/user/wishlist/${productId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.data?.status === 200) {
                    setWishlistStatus(prev => ({ ...prev, [productId]: false }));
                    updateWishlistCount(prev => Math.max(0, prev - 1));
                }
            } else {
                // Add to wishlist
                const res = await axios.post(
                    `${API_BASE}/user/wishlist`,
                    {
                        product_id: productId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.data?.status === 201 || res.data?.status === 200) {
                    setWishlistStatus(prev => ({ ...prev, [productId]: true }));
                    updateWishlistCount(prev => prev + 1);
                }
            }
        } catch (err) {
            console.error("Wishlist toggle error:", err.response?.data || err);
            // You could show a toast notification here
        } finally {
            setWishlistLoading(prev => ({ ...prev, [productId]: false }));
        }
    }, [user, wishlistStatus, navigate, updateWishlistCount, wishlistLoading]);

    /* ========================
       FILTER + SORT
       ======================== */
    useEffect(() => {
        let temp = [...products];

        if (searchName) {
            temp = temp.filter(p =>
                p.name?.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        if (selectedYear) {
            temp = temp.filter(p => p.year === Number(selectedYear));
        }

        if (selectedKit) {
            temp = temp.filter(
                p => p.kit_type?.toLowerCase() === selectedKit.toLowerCase()
            );
        }

        if (selectedLeague) {
            temp = temp.filter(p => p.league === selectedLeague);
        }

        switch (sortOption) {
            case "price-asc":
                temp.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                temp.sort((a, b) => b.price - a.price);
                break;
            case "year-asc":
                temp.sort((a, b) => a.year - b.year);
                break;
            case "year-desc":
                temp.sort((a, b) => b.year - a.year);
                break;
            default:
                break;
        }

        setFilteredProducts(temp);
        setCurrentPage(1);
    }, [
        searchName,
        selectedYear,
        selectedKit,
        selectedLeague,
        sortOption,
        products,
    ]);

    /* ========================
       PAGINATION
       ======================== */
    useEffect(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setDisplayedProducts(filteredProducts.slice(start, end));
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const clearFilters = () => {
        setSearchName("");
        setSelectedYear("");
        setSelectedKit("");
        setSelectedLeague("");
        setSortOption("year-desc");
    };

    /* ========================
       PRODUCT CARD COMPONENT
       ======================== */
    const ProductCard = ({ product }) => {
        const isInWishlist = wishlistStatus[product.id] || false;
        const isLoading = wishlistLoading[product.id] || false;

        return (
            <div
                className="group bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer relative"
                onClick={() => navigate(`/product/${product.id}`)}
            >
                {/* Wishlist Toggle Button */}
                <button
                    onClick={(e) => toggleWishlist(product.id, e)}
                    disabled={isLoading}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95 ${isInWishlist
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-white/90 text-gray-700 hover:bg-white hover:text-red-500"
                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <Heart
                        className={`w-5 h-5 transition-all duration-200 ${isInWishlist ? "fill-current" : ""
                            }`}
                    />
                </button>

                {/* Product Image */}
                <div className="relative overflow-hidden h-64">
                    <img
                        src={product.image_url || "/fallback.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white font-semibold bg-black/50 px-4 py-2 rounded-lg">
                            Quick View
                        </span>
                    </div>
                </div>

                {/* Product Details */}
                <div className="p-4 space-y-2">
                    <h2 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {product.name}
                    </h2>

                    <div className="flex items-center gap-2">
                        {product.league && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                {product.league}
                            </span>
                        )}
                        {product.kit_type && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                                {product.kit_type}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Year: {product.year}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-2xl font-bold text-rose-600">
                            ₹{product.price}
                        </span>

                        {/* Stock Status */}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}>
                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    /* ========================
       UI
       ======================== */
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />

            <div className="flex-grow">
                {/* Header */}
                <div className="bg-gray-50 py-16 px-6 border-b border-gray-100 text-center mb-10">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-4">
                            SHOP <span className="text-gray-400">COLLECTION</span>
                        </h1>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            Discover our exclusive collection of football jerseys.
                            Filter by your favorite team, league, or year.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {error && (
                    <div className="flex justify-center items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {!error && (
                    <FilterSection
                        searchName={searchName}
                        setSearchName={setSearchName}
                        selectedYear={selectedYear}
                        setSelectedYear={setSelectedYear}
                        selectedKit={selectedKit}
                        setSelectedKit={setSelectedKit}
                        selectedLeague={selectedLeague}
                        setSelectedLeague={setSelectedLeague}
                        availableYears={availableYears}
                        availableLeagues={availableLeagues}
                        sortOption={sortOption}
                        setSortOption={setSortOption}
                        clearFilters={clearFilters}
                    />
                )}

                {/* Results Info */}
                {!loading && (
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-700">
                            Showing <span className="font-semibold">{displayedProducts.length}</span> of{" "}
                            <span className="font-semibold">{filteredProducts.length}</span> products
                        </p>
                        {!user && (
                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Sign in</span> to save items to your wishlist
                            </p>
                        )}
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                                <div className="h-64 bg-gray-300" />
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-300 rounded" />
                                    <div className="h-3 bg-gray-300 rounded w-3/4" />
                                    <div className="h-6 bg-gray-300 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <div className="w-24 h-24 mx-auto mb-6 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!loading && filteredProducts.length > 0 && (
                    <div className="mt-12">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}

                {/* Call to Action */}
                {!loading && user && filteredProducts.length > 0 && (
                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                            <Heart className="w-5 h-5 text-red-500 fill-current" />
                            <span className="text-gray-700">
                                <span className="font-semibold">
                                    {Object.values(wishlistStatus).filter(Boolean).length}
                                </span>{" "}
                                items in your wishlist
                            </span>
                            <button
                                onClick={() => navigate("/wishlist")}
                                className="ml-4 px-4 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                View Wishlist
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default Shop;