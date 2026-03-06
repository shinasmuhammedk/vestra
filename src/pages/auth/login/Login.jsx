import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    ArrowRight,
    Sparkles,
    Star,
    Zap,
    Award,
    Bell,
} from "lucide-react";
// Removed unused: Shield, TrendingUp, rememberMe state
import Navbar from "../../../components/navbar/Navbar";
import { useAuth } from "../../../context/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // removed: rememberMe (unused)
    const { login } = useAuth();

    async function handleLogin(e) {
        e.preventDefault();

        if (!email || !password) {
            toast.warn("Please enter email and password");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            // AuthContext login handles everything — fetch, cookie, profile
            const userData = await login(email, password);

            if (!userData) {
                toast.error("Invalid email or password");
                return;
            }

            if (userData.role === "admin") {
                toast.success("Welcome back, Admin! 👑");
                navigate("/admin");
            } else if (userData.role === "vip") {
                toast.success("Welcome back, VIP Member! ⭐");
                navigate("/");
            } else {
                toast.success("Welcome back to VESTRA! 🎉");
                navigate("/");
            }

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-cyan-50/20">
            <Navbar />

            <div className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>

                <div className="absolute top-20 left-5 w-56 h-56 bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-40 right-10 w-64 h-64 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>

                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f9ff_1px,transparent_1px),linear-gradient(to_bottom,#f0f9ff_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-80px)] px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                    
                    {/* Left Side */}
                    <div className="lg:w-1/2 lg:pr-10 mb-8 lg:mb-0">
                        <div className="max-w-lg mx-auto lg:mx-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/30">
                                        <div className="h-8 w-8 border-2 border-white/40 rounded-lg flex items-center justify-center">
                                            <Sparkles className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                                        <Star className="h-2.5 w-2.5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-emerald-700 via-cyan-700 to-blue-700 bg-clip-text text-transparent">
                                        VESTRA
                                    </h1>
                                    <p className="text-sm text-gray-500 font-medium">Premium Sportswear</p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                                    Welcome Back to <br />
                                    <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                        Excellence
                                    </span>
                                </h2>
                                <p className="text-base text-gray-600 mb-6">
                                    Sign in to access your personalized dashboard, track orders, and unlock exclusive benefits.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="lg:w-1/2 lg:max-w-md">
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden">
                            <div className="relative p-6 pb-4">
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Sign In to Your Account</h3>
                                <p className="text-sm text-gray-500">Access your orders, wishlist, and preferences</p>
                            </div>

                            <div className="px-6 pb-6">
                                <form onSubmit={handleLogin} className="space-y-5">
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all group-hover:bg-gray-100/50 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => navigate("/forgot-password")}
                                                className="text-xs text-emerald-600 hover:text-emerald-800 transition-colors font-medium"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full pl-10 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all group-hover:bg-gray-100/50 text-sm"
                                                required
                                                minLength="6"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-emerald-500 hover:text-emerald-700" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-emerald-500 hover:text-emerald-700" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md relative overflow-hidden group text-sm"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        {loading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                <span className="relative">Signing in...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center relative">
                                                <span>Sign In to Dashboard</span>
                                                <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-3 bg-white text-gray-500">Don't have an account?</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Link
                                        to="/register"
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-emerald-500 text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-all duration-300 group hover:border-emerald-600 text-sm"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        <span>Create Free Account</span>
                                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-gray-50 to-emerald-50/30 px-6 py-3 border-t border-gray-100">
                                <p className="text-xs text-center text-gray-500">
                                    By signing in, you agree to our{" "}
                                    <a href="/terms" className="text-emerald-600 hover:text-emerald-800 font-medium">Terms</a>
                                    {" "}and{" "}
                                    <a href="/privacy" className="text-emerald-600 hover:text-emerald-800 font-medium">Privacy Policy</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-2 z-20">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex flex-col items-center">
                                <Zap className="h-3 w-3 text-amber-500 mb-1" />
                                <span className="font-medium text-gray-900">Fast Shipping</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Award className="h-3 w-3 text-emerald-500 mb-1" />
                                <span className="font-medium text-gray-900">Quality</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Bell className="h-3 w-3 text-blue-500 mb-1" />
                                <span className="font-medium text-gray-900">Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(20px, -20px) scale(1.05); }
                    66% { transform: translate(-15px, 15px) scale(0.95); }
                }
                .animate-blob { animation: blob 10s infinite ease-in-out; }
                .animation-delay-2000 { animation-delay: 2s; }
            `}</style>
        </div>
    );
}

export default Login;