import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaPlus,
    FaShoppingBag,
    FaCreditCard,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../navbar/Navbar";

function BuyNow() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const location = useLocation();

    // Check for both cart flow and direct buy now flow
    const fromCart = location.state?.fromCart;
    const cartProducts = location.state?.products;

    // FIX: Get selectedSize and quantity from ProductDetail navigation state
    const passedProduct = location.state?.product;
    const passedSize = location.state?.selectedSize;
    const passedQuantity = location.state?.quantity;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: "", phone: "", address: "", city: "", state: "", zip_code: "", country: "",
    });
    const [placingOrder, setPlacingOrder] = useState(false);

    const token = sessionStorage.getItem("access_token");
    const API_URL = "http://localhost:3000";

    const dataLoaded = useRef(false);

    useEffect(() => {
        if (!token) {
            toast.error("Please login to continue");
            navigate("/login");
            return;
        }

        if (dataLoaded.current) return;

        if (fromCart && cartProducts?.length > 0) {
            // Cart flow
            setProducts(cartProducts.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                price: item.product.price,
                image_url: item.product.image_url,
                size: item.size,
                quantity: item.quantity
            })));
            setLoading(false);
            dataLoaded.current = true;
        } else if (passedProduct && passedSize) {
            // FIX: Direct Buy Now flow - use passed data from ProductDetail
            console.log("DEBUG: Loading from passed state:", { passedProduct, passedSize, passedQuantity });

            // Process sizes for display
            let availableSizes = [];
            if (passedProduct.sizes && passedProduct.sizes.length > 0) {
                if (typeof passedProduct.sizes[0] === 'object') {
                    availableSizes = passedProduct.sizes.map(s => ({
                        value: s.size || s.name,
                        quantity: s.quantity || 0,
                        id: s.id
                    }));
                } else {
                    availableSizes = passedProduct.sizes.map(s => ({ value: s, quantity: 10 }));
                }
            }

            setProducts([{
                productId: passedProduct.id,
                name: passedProduct.name,
                price: passedProduct.price,
                image_url: passedProduct.image_url,
                size: passedSize,        // FIX: Use the size user selected
                quantity: passedQuantity || 1,  // FIX: Use the quantity user selected
                availableSizes: availableSizes
            }]);

            setLoading(false);
            dataLoaded.current = true;
        } else if (productId) {
            // Fallback: fetch from API if no state passed (e.g., page refresh)
            console.log("DEBUG: No state passed, fetching from API");
            fetchSingleProduct(productId);
        } else {
            toast.error("No products selected");
            navigate("/products");
        }

        fetchAddresses();
    }, [productId, fromCart, cartProducts, passedProduct, passedSize, passedQuantity, navigate, token]);

    const fetchSingleProduct = async (id) => {
        try {
            const res = await axios.get(`${API_URL}/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const product = res.data.data;

            let availableSizes = [];
            let defaultSize = "";

            if (product.sizes && product.sizes.length > 0) {
                if (typeof product.sizes[0] === 'object') {
                    availableSizes = product.sizes.map(s => ({
                        value: s.size || s.name,
                        quantity: s.quantity || 0,
                        id: s.id
                    }));
                    const maxStockSize = availableSizes.reduce((prev, current) =>
                        (prev.quantity > current.quantity) ? prev : current
                    );
                    defaultSize = maxStockSize.value;
                } else {
                    availableSizes = product.sizes.map(s => ({ value: s, quantity: 10 }));
                    defaultSize = product.sizes[0];
                }
            }

            const productData = {
                productId: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                size: defaultSize,
                quantity: 1,
                availableSizes: availableSizes
            };

            setProducts([productData]);
            dataLoaded.current = true;

        } catch (err) {
            console.error("DEBUG: Fetch product error:", err);
            toast.error("Failed to load product");
            navigate("/products");
        } finally {
            setLoading(false);
        }
    };

    const updateProductSize = (size) => {
        setProducts(prev => prev.map(p => ({ ...p, size })));
    };

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${API_URL}/user/address`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const addrList = res.data.data || [];
            setAddresses(addrList);
            if (addrList.length > 0) setSelectedAddressId(addrList[0].id);
        } catch (err) {
            toast.error("Failed to load addresses");
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return;
        }

        const product = products[0];

        if (!product?.size) {
            toast.error("Please select a size");
            return;
        }

        setPlacingOrder(true);

        try {
            if (fromCart) {
                await axios.post(
                    `${API_URL}/user/orders`,
                    { type: "cart", address_id: selectedAddressId },
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
                );
            } else {
                console.log("DEBUG: Placing order with size:", product.size);

                await axios.post(
                    `${API_URL}/user/orders`,
                    {
                        type: "direct",
                        product_id: product.productId,
                        quantity: product.quantity,
                        size: product.size,  // This will be the correct selected size
                        address_id: selectedAddressId
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );
            }

            toast.success("🎉 Order placed successfully!");
            navigate("/orders");
        } catch (err) {
            console.error("DEBUG: Order error:", err.response?.data);
            toast.error(err.response?.data?.message || "Failed to place order");
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </>
        );
    }

    const product = products[0];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <button onClick={() => navigate(fromCart ? "/cart" : -1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-800">
                        <FaArrowLeft /> Back
                    </button>

                    <h1 className="text-3xl font-bold mb-8">Buy Now</h1>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Product Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <FaShoppingBag /> Product
                            </h2>

                            {product && (
                                <div className="flex gap-4 mb-6">
                                    <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
                                    <div>
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <p className="text-gray-600">₹{product.price}</p>
                                    </div>
                                </div>
                            )}

                            {/* SIZE SELECTION */}
                            {product?.availableSizes && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">
                                        Select Size: <span className="text-blue-600 font-bold text-lg">{product.size}</span>
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {[...product.availableSizes]
                                            .sort((a, b) => {
                                                // Define standard clothing size order
                                                const sizeOrder = {
                                                    'XS': 1,
                                                    'S': 2,
                                                    'M': 3,
                                                    'L': 4,
                                                    'XL': 5,
                                                    'XXL': 6,
                                                    '3XL': 7,
                                                    'XXXL': 8
                                                };

                                                const valA = a.value?.toString().toUpperCase();
                                                const valB = b.value?.toString().toUpperCase();

                                                // If both are standard sizes, sort by predefined order
                                                if (sizeOrder[valA] && sizeOrder[valB]) {
                                                    return sizeOrder[valA] - sizeOrder[valB];
                                                }

                                                // Standard sizes come before non-standard
                                                if (sizeOrder[valA]) return -1;
                                                if (sizeOrder[valB]) return 1;

                                                // For numeric sizes or other strings, sort numerically if possible, alphabetically otherwise
                                                const numA = parseFloat(valA);
                                                const numB = parseFloat(valB);

                                                if (!isNaN(numA) && !isNaN(numB)) {
                                                    return numA - numB;
                                                }

                                                return valA.localeCompare(valB);
                                            })
                                            .map((sizeObj, idx) => (
                                                <button
                                                    key={`size-${sizeObj.value}-${idx}`}
                                                    type="button"
                                                    onClick={() => updateProductSize(sizeObj.value)}
                                                    className={`px-4 py-2 border-2 rounded-lg ${product.size === sizeObj.value
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "bg-white border-gray-300 hover:bg-gray-50"
                                                        } ${sizeObj.quantity <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    disabled={sizeObj.quantity <= 0}
                                                >
                                                    <div className="font-bold">{sizeObj.value}</div>
                                                    <div className="text-xs opacity-75">{sizeObj.quantity} left</div>
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* QUANTITY */}
                            {!fromCart && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">Quantity</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setProducts(prev => prev.map(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) })))}
                                            className="w-8 h-8 border rounded"
                                        >-</button>
                                        <span className="font-bold w-8 text-center">{product.quantity}</span>
                                        <button
                                            onClick={() => setProducts(prev => prev.map(p => ({ ...p, quantity: p.quantity + 1 })))}
                                            className="w-8 h-8 border rounded"
                                        >+</button>
                                    </div>
                                </div>
                            )}

                            <div className="border-t pt-4 mt-6">
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span>₹{product.price * product.quantity}</span>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                                <FaMapMarkerAlt /> Delivery Address
                            </h2>

                            {addresses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No saved addresses</p>
                                </div>
                            ) : (
                                <div className="space-y-3 mb-6">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                            className={`border rounded-lg p-4 cursor-pointer ${selectedAddressId === addr.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                                }`}
                                        >
                                            <p className="font-semibold">{addr.name}</p>
                                            <p className="text-sm text-gray-600">{addr.phone}</p>
                                            <p className="text-sm">{addr.city}, {addr.state}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handlePlaceOrder}
                                disabled={placingOrder || !selectedAddressId || !product.size}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-300"
                            >
                                {placingOrder ? "Processing..." : `Place Order - Size ${product.size}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BuyNow;