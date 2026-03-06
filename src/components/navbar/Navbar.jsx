import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { 
  FiMenu, 
  FiX, 
  FiUser, 
  FiPackage, 
  FiHeart, 
  FiShoppingBag,
  FiSearch,
  FiHome,
  FiShoppingCart,
  FiInfo,
  FiMail,
  FiLogOut,
  FiChevronDown,
  FiBell
} from "react-icons/fi";
import { 
  IoSearchOutline,
  IoPersonOutline,
  IoBagOutline,
  IoHeartOutline
} from "react-icons/io5";
import { 
  HiOutlineShoppingBag, 
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineSparkles
} from "react-icons/hi";
import { CartContext } from "../../context/CartContext";
import { WishlistContext } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const { cartCount } = React.useContext(CartContext);
  const { wishlistCount } = React.useContext(WishlistContext);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 text-sm transition-all duration-300 relative group ${
      isActive 
        ? "text-gray-900 font-medium"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <>
      {/* Announcement Bar - Minimal */}
      {/* <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-1.5 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            <HiOutlineSparkles className="w-3 h-3 text-emerald-300" />
            <span className="font-medium">Free shipping on orders over $99</span>
            <HiOutlineSparkles className="w-3 h-3 text-emerald-300" />
          </div>
        </div>
      </div> */}

      {/* Main Navigation */}
      <nav 
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/90 backdrop-blur-md border-b border-gray-100 py-3" 
            : "bg-white py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 group"
            >
              {/* <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-sm tracking-tighter">V</span>
              </div> */}
              <span className="text-xl font-bold tracking-tight text-gray-900">
                VESTRA
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavLink to="/" className={navLinkClass}>
                <span className="flex items-center gap-1.5">
                  <FiHome className="w-3.5 h-3.5" />
                  Home
                </span>
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </NavLink>
              
              <NavLink to="/products" className={navLinkClass}>
                <span className="flex items-center gap-1.5">
                  <FiShoppingBag className="w-3.5 h-3.5" />
                  Shop
                </span>
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </NavLink>
              
              <NavLink to="/about" className={navLinkClass}>
                <span className="flex items-center gap-1.5">
                  <FiInfo className="w-3.5 h-3.5" />
                  About
                </span>
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </NavLink>
              
              <NavLink to="/contact" className={navLinkClass}>
                <span className="flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5" />
                  Contact
                </span>
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </NavLink>
            </div>

            {/* Desktop Action Icons */}
            <div className="hidden lg:flex items-center space-x-1">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                {/* <button 
                  onClick={() => setShowSearch(!showSearch)} 
                  className={`p-2 rounded-full transition-all ${
                    showSearch 
                      ? "bg-gray-100 text-gray-900" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <IoSearchOutline className="w-5 h-5" />
                </button> */}
                {showSearch && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-2 animate-in slide-in-from-top-2 duration-150">
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                        autoFocus
                      />
                      <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </form>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link 
                to="/wishlist" 
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoHeartOutline className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoBagOutline className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              <div className="relative" ref={dropdownRef}>
                {user ? (
                  <>
                    <button 
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white text-xs font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <FiChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                        showProfileDropdown ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 animate-in slide-in-from-top-2 duration-150">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                        </div>
                        
                        {/* Profile */}
                        <Link 
                          to="/profile" 
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <FiUser className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        
                        {/* My Orders - Added Section */}
                        <Link 
                          to="/orders" 
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <FiPackage className="w-4 h-4" />
                          <span>My Orders</span>
                        </Link>
                        
                        {/* Logout */}
                        <button 
                          onClick={handleLogout} 
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 w-full text-left"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`lg:hidden fixed inset-0 bg-white z-[60] transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900">VESTRA</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-6 border-b border-gray-100">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </form>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-1">
                <Link 
                  to="/" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <FiHome className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  <span className="font-medium">Home</span>
                </Link>
                
                <Link 
                  to="/products" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <FiShoppingBag className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  <span className="font-medium">Shop</span>
                </Link>
                
                <Link 
                  to="/about" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <FiInfo className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  <span className="font-medium">About</span>
                </Link>
                
                <Link 
                  to="/contact" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <FiMail className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  <span className="font-medium">Contact</span>
                </Link>
                
                {/* My Orders in Mobile Menu */}
                {user && (
                  <Link 
                    to="/orders" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group mt-4 border-t border-gray-100 pt-4"
                  >
                    <FiPackage className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    <span className="font-medium">My Orders</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Bottom Actions */}
            <div className="border-t border-gray-100 p-6">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white text-sm font-medium">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      to="/profile" 
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiUser className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiLogOut className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link 
                    to="/login" 
                    className="block w-full bg-gradient-to-r from-gray-900 to-black text-white text-center py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <p className="text-center text-sm text-gray-500">
                    New to VESTRA?{' '}
                    <Link 
                      to="/register" 
                      className="text-gray-900 font-medium hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              )}
              
              {/* Mobile Quick Actions */}
              <div className="flex items-center justify-around pt-6 border-t border-gray-100 mt-6">
                <Link 
                  to="/wishlist" 
                  className="flex flex-col items-center p-2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative">
                    <FiHeart className="w-5 h-5 text-gray-600" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1">Wishlist</span>
                </Link>
                
                <Link 
                  to="/cart" 
                  className="flex flex-col items-center p-2"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative">
                    <FiShoppingCart className="w-5 h-5 text-gray-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1">Cart</span>
                </Link>
                
                {user && (
                  <Link 
                    to="/orders" 
                    className="flex flex-col items-center p-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiPackage className="w-5 h-5 text-gray-600" />
                    <span className="text-xs mt-1">Orders</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;