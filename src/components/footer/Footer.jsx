import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

function Footer() {
    return (
        <footer className="bg-black text-white py-10 mt-16">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Brand Section */}
                <div>
                    <h2 className="text-2xl font-bold">VESTRA</h2>
                    <p className="mt-3 text-gray-400 text-sm">
                        Premium football jerseys for true fans.
                        Show your passion with style!
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link to="/" className="hover:text-white">Home</Link></li>
                        <li><Link to="/products" className="hover:text-white">Shop</Link></li>
                        <li><Link to="/about" className="hover:text-white">About</Link></li>
                        <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                    </ul>
                </div>


                <div>
                    <h3 className="text-lg font-semibold mb-3">Customer Care</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><Link to="" className="hover:text-white">FAQ's</Link></li>
                        <li><Link to="" className="hover:text-white">Shipping Policy</Link></li>
                        <li><Link to="" className="hover:text-white">Return Policy</Link></li>
                    </ul>
                </div>


                {/* Social Media */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                    <div className="flex space-x-4">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500">
                            <FaFacebook size={24} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-500">
                            <FaInstagram size={24} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-sky-400">
                            <FaTwitter size={24} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom line */}
            <div className="text-center text-gray-500 text-sm mt-10 border-t border-gray-700 pt-4">
                © {new Date().getFullYear()} VESTRA. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
