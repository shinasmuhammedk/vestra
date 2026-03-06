import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, Globe } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import Button from "../../../components/button/Button";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use toast.success for a better user experience on success
    toast.success(`Message sent! We'll get back to you, ${formData.name}.`);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-grow">
        {/* Header Section */}
        <section className="bg-gray-50 py-16 px-6 border-b border-gray-100">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-4">
              GET IN <span className="text-gray-400">TOUCH</span>
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Have a question about a specific kit or an existing order? Our squad is here to help you out.
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Side: Contact Info Card */}
              <div className="lg:col-span-5 space-y-8">
                <div className="bg-black text-white p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-800 rounded-full blur-3xl opacity-50"></div>
                  
                  <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <Phone size={20} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-medium">Call Us</p>
                        <p className="text-lg font-semibold">+91 98765 43210</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <Mail size={20} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-medium">Email Support</p>
                        <p className="text-lg font-semibold">support@vestra.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <MapPin size={20} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-medium">Visit HQ</p>
                        <p className="text-lg font-semibold">123 Jersey St, Football City, India</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex items-center gap-3 text-gray-400">
                      <Clock size={18} />
                      <p className="text-sm">Mon - Sat: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Social/Trust Badges */}
                <div className="p-8 border border-gray-100 rounded-[2rem] bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Global Shipping</p>
                    <p className="text-sm text-gray-500">Available in 20+ countries</p>
                  </div>
                  <Globe className="text-gray-300" size={32} />
                </div>
              </div>

              {/* Right Side: Contact Form */}
              <div className="lg:col-span-7 bg-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Order Inquiry / Custom Kit"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Message</label>
                    <textarea
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help..."
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
                      required
                    ></textarea>
                  </div>

                  <Button type="submit" variant="primary" className="w-full py-4 text-lg flex items-center justify-center gap-2 group">
                    Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;