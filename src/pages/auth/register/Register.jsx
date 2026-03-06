import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  Sparkles,
  Star,
  CheckCircle,
  Zap,
  Award,
  Bell,
  TrendingUp,
  Users,
  Gift,
  Truck,
  CreditCard
} from "lucide-react";
import Navbar from "../../../components/navbar/Navbar";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const benefits = [
    { icon: <Truck className="h-4 w-4" />, text: "Free Shipping Over $99" },
    { icon: <Gift className="h-4 w-4" />, text: "Exclusive Member Discounts" },
    { icon: <CreditCard className="h-4 w-4" />, text: "Secure Payment" },
    { icon: <Users className="h-4 w-4" />, text: "Priority Customer Support" }
  ];

  async function handleRegister(e) {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.warn("All fields are required!");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed");
        return;
      }

      toast.success("OTP sent to your email 📧");

      // Store email temporarily for OTP verification
      localStorage.setItem("signup_email", email);

      // Redirect to OTP verification page
      navigate("/verify-otp");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-emerald-50/20">
      <Navbar />

      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-cyan-500"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-5 w-56 h-56 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-emerald-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f9ff_1px,transparent_1px),linear-gradient(to_bottom,#f0f9ff_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-80px)] px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Left Side - Brand & Benefits */}
          <div className="lg:w-1/2 lg:pr-10 mb-8 lg:mb-0">
            <div className="max-w-lg mx-auto lg:mx-0">
              {/* Brand Logo */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/30">
                    <div className="h-8 w-8 border-2 border-white/40 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-700 via-emerald-700 to-cyan-700 bg-clip-text text-transparent">
                    VESTRA
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">Join Our Community</p>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  Start Your Journey <br />
                  <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    With Excellence
                  </span>
                </h2>
                <p className="text-base text-gray-600 mb-6">
                  Create your VESTRA account to unlock exclusive benefits, track orders, and enjoy premium sportswear.
                </p>
              </div>

              {/* Benefits Grid */}
              {/* <div className="grid grid-cols-2 gap-3 mb-8">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-100 to-emerald-100 flex items-center justify-center text-blue-600">
                      {benefit.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{benefit.text}</span>
                  </div>
                ))}
              </div> */}
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="lg:w-1/2 lg:max-w-md">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden">
              {/* Form Header */}
              <div className="relative p-6 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Create Your Account</h3>
                <p className="text-sm text-gray-500">Join VESTRA and unlock premium benefits</p>
              </div>

              {/* Register Form */}
              <div className="px-6 pb-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all group-hover:bg-gray-100/50 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all group-hover:bg-gray-100/50 text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all group-hover:bg-gray-100/50 text-sm"
                        required
                        minLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                        ) : (
                          <Eye className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">Minimum 6 characters required</p>
                  </div>

                  

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white font-bold bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md relative overflow-hidden group text-sm mt-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        <span className="relative">Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center relative">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Create Account</span>
                        <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="mt-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-500">
                      Already have an account?
                    </span>
                  </div>
                </div>

                {/* Login Link */}
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-blue-500 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all duration-300 group hover:border-blue-600 text-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Sign In Instead</span>
                    <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* OTP Note */}
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-center text-blue-700">
                    <span className="font-medium">Note:</span> After registration, you'll receive an OTP to verify your email address.
                  </p>
                </div>
              </div>

             
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar - Mobile Only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-2 z-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col items-center">
                <Zap className="h-3 w-3 text-amber-500 mb-1" />
                <span className="font-medium text-gray-900">Fast Setup</span>
              </div>
              <div className="flex flex-col items-center">
                <Award className="h-3 w-3 text-emerald-500 mb-1" />
                <span className="font-medium text-gray-900">Exclusive Deals</span>
              </div>
              <div className="flex flex-col items-center">
                <Bell className="h-3 w-3 text-blue-500 mb-1" />
                <span className="font-medium text-gray-900">Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(20px, -20px) scale(1.05);
          }
          66% {
            transform: translate(-15px, 15px) scale(0.95);
          }
        }
        .animate-blob {
          animation: blob 10s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

export default Register;