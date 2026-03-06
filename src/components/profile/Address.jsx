import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPlus, 
  FaTrash, 
  FaMapMarkerAlt, 
  FaHome, 
  FaPhone, 
  FaUser, 
  FaCity, 
  FaMailBulk, 
  FaGlobe,
  FaCheck,
  FaEdit,
  FaExclamationTriangle
} from "react-icons/fa";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

const API_URL = "http://localhost:3000";

// Input Component with Icon
const InputField = ({ icon: Icon, label, name, value, onChange, type = "text", required = false, placeholder }) => (
  <div className="relative group">
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      </div>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={3}
          className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
        />
      )}
    </div>
  </div>
);

// Skeleton Loader
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

// Empty State
const EmptyState = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full flex flex-col items-center justify-center py-12 px-4 text-center"
  >
    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
      <FaMapMarkerAlt className="text-3xl text-blue-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
    <p className="text-gray-500 max-w-xs mx-auto mb-6">
      Add your first delivery address to get started with faster checkout
    </p>
  </motion.div>
);

// Confirmation Modal
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <FaExclamationTriangle className="text-2xl" />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <FaTrash /> Delete Address
          </button>
        </div>
      </motion.div>
    </div>
  );
};

function Address() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formStep, setFormStep] = useState(0);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });

  const token = sessionStorage.getItem("access_token");

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.post(`${API_URL}/user/address`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Address added successfully!", {
        icon: <FaCheck className="text-green-500" />
      });
      
      setFormData({
        full_name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
      });
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to add address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/user/address/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Address deleted successfully");
      fetchAddresses();
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="p-2 bg-blue-600 rounded-lg">
              <FaMapMarkerAlt className="text-white text-xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Addresses</h1>
          </motion.div>
          <p className="text-gray-600 ml-12">Add and manage your delivery locations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 xl:col-span-4"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaPlus className="text-sm" /> Add New Address
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <InputField
                  icon={FaUser}
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />

                <InputField
                  icon={FaPhone}
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 (555) 000-0000"
                />

                <InputField
                  icon={FaHome}
                  label="Street Address"
                  name="address"
                  type="textarea"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Main Street, Apt 4B"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    icon={FaCity}
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="New York"
                  />
                  <InputField
                    icon={FaMapMarkerAlt}
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="NY"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    icon={FaMailBulk}
                    label="ZIP Code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    required
                    placeholder="10001"
                  />
                  <InputField
                    icon={FaGlobe}
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    placeholder="USA"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaPlus /> Add Address
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Address List Section */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Saved Addresses ({addresses.length})
                </h3>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {addresses.length === 0 ? (
                      <EmptyState />
                    ) : (
                      addresses.map((addr, index) => (
                        <motion.div
                          key={addr.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -4 }}
                          className="group bg-white rounded-2xl p-5 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                        >
                          {/* Default Badge */}
                          {addr.is_default && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                              Default
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                              <FaHome className="text-blue-600 text-lg" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate pr-8">
                                {addr.full_name}
                              </h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <FaPhone className="text-xs" /> {addr.phone}
                              </p>
                              
                              <div className="mt-3 space-y-1 text-sm text-gray-600">
                                <p className="leading-relaxed">{addr.address}</p>
                                <p>{addr.city}, {addr.state} {addr.zip_code}</p>
                                <p className="font-medium text-gray-700">{addr.country}</p>
                              </div>

                              <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setDeleteId(addr.id)}
                                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  <FaTrash className="text-xs" /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Address?"
        message="Are you sure you want to remove this address? This action cannot be undone and may affect pending orders."
      />
    </div>
  );
}

export default Address;