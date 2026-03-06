import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaTrash, 
  FaPlus, 
  FaMapMarkerAlt, 
  FaHome, 
  FaPhone, 
  FaEdit,
  FaSignOutAlt,
  FaIdCard
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import { useAuth } from "../../context/AuthContext";

// Skeleton Component for loading states
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Confirm Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onAdd }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-12 px-4"
  >
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <FaMapMarkerAlt className="text-3xl text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
      Add your first address to make checkout faster and easier
    </p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
    >
      <FaPlus /> Add your first address
    </button>
  </motion.div>
);

// Address Card Component
const AddressCard = ({ address, onDelete, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.01 }}
    className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-lg">
            <FaHome className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{address.name}</p>
            {address.is_default && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                Default
              </span>
            )}
          </div>
        </div>
        
        <div className="pl-12 space-y-1">
          <p className="text-gray-600 leading-relaxed">
            {address.address}, {address.city}, {address.state} {address.zip_code}
          </p>
          <p className="text-gray-500 text-sm">{address.country}</p>
          {address.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <FaPhone className="text-xs" />
              <span>{address.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(address.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          title="Delete address"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  </motion.div>
);

function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const token = sessionStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        await Promise.all([fetchProfile(), fetchAddresses()]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data);
    } catch (err) {
      toast.error("Session expired. Please login again.");
      logout();
      navigate("/login");
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await axios.get("http://localhost:3000/user/address", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch addresses");
    }
  };

  const deleteAddress = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/user/address/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      toast.success("Address deleted successfully");
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-24 h-24 rounded-full mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and addresses</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-32 relative">
                <div className="absolute -bottom-12 left-6">
                  <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-3xl text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-14 px-6 pb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <FaIdCard className="text-gray-400" />
                    <span>Member since 2024</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <FaMapMarkerAlt className="text-gray-400" />
                    <span>{addresses.length} Saved Addresses</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium w-full justify-center py-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            >
              <h3 className="font-semibold text-gray-900 mb-3 px-2">Quick Links</h3>
              <nav className="space-y-1">
                {[
                  { id: "profile", label: "Profile Details", icon: FaUser },
                  { id: "addresses", label: "My Addresses", icon: FaMapMarkerAlt },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className={activeTab === item.id ? "text-blue-600" : "text-gray-400"} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
                      <p className="text-sm text-gray-500">Update your personal details</p>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      <FaEdit /> Edit Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                        {user?.name}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email Address
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                        {user?.email}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-500 italic">
                        Not provided
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Account Type
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Active Member
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
                        <p className="text-sm text-gray-500">Manage your delivery addresses</p>
                      </div>
                      <button
                        onClick={() => navigate("/address")}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                      >
                        <FaPlus /> Add Address
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <EmptyState onAdd={() => navigate("/address")} />
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((addr, index) => (
                          <AddressCard 
                            key={addr.id} 
                            address={addr} 
                            index={index}
                            onDelete={setDeleteId}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteAddress(deleteId)}
        title="Delete Address?"
        message="Are you sure you want to delete this address? This action cannot be undone."
      />
    </div>
  );
}

export default Profile;