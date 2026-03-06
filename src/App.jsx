import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Home from "./pages/noneAuth/landing/hero/Home";
import Register from "./pages/auth/register/Register";
import Login from "./pages/auth/login/Login";
// import ForgotPassword from "./pages/auth/forgotPassword/ForgotPassword";
import OtpVerify from "./pages/auth/verifyOtp/verifyOtp";

import Shop from "./pages/noneAuth/shop/Shop";
import About from "./pages/noneAuth/about/About";
import Contact from "./pages/noneAuth/contact/Contact";
import ProductDetail from "./pages/product/ProductDetail";

import Cart from "./components/cart/Cart";
import Wishlist from "./components/wishlist/WishList";
import Orders from "./components/orders/Orders";
import BuyNow from "./components/buynow/BuyNow";
import Profile from "./components/profile/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./pages/auth/forgotPassword/ForgotPassword";
import Address from "./components/profile/Address";

/* 🔒 AuthRoute → only for NON-logged-in users */
function AuthRoute({ children }) {
    const userId = localStorage.getItem("userId");
    if (userId) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    return (
        <Router>

            <Routes>
                {/* 🌐 Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Shop />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/product/:id" element={<ProductDetail />} />

                {/* 🔓 Auth Routes (only if NOT logged in) */}
                <Route
                    path="/register"
                    element={
                        <AuthRoute>
                            <Register />
                        </AuthRoute>
                    }
                />

                <Route
                    path="/login"
                    element={
                        <AuthRoute>
                            <Login />
                        </AuthRoute>
                    }
                />

                <Route
                    path="/forgot-password"
                    element={
                        <AuthRoute>
                            <ForgotPassword />
                        </AuthRoute>
                    }
                />

                <Route
                    path="/verify-otp"
                    element={
                        <AuthRoute>
                            <OtpVerify />
                        </AuthRoute>
                    }
                />

                {/* 🔒 Protected Routes */}
                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/wishlist"
                    element={
                        <ProtectedRoute>
                            <Wishlist />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />
                <Route path="/buy-now" element={<ProtectedRoute><BuyNow /></ProtectedRoute>} />


                <Route
                    path="/buy-now/:productId"  // ← Added :productId parameter
                    element={
                        <ProtectedRoute>
                            <BuyNow />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route path="/address" element={<Address />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requireAdmin={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ❌ Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
            />
        </Router>
    );
}

export default App;