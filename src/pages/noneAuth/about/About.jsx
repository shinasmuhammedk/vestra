import React from "react";
import { useNavigate } from "react-router-dom";
import { Target, Heart, ShieldCheck, ArrowRight, Trophy, Globe, Zap } from "lucide-react";
import Footer from "../../../components/footer/Footer";
import Button from "../../../components/button/Button";
import Navbar from "../../../components/navbar/Navbar";

function About() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow">
                {/* About Section Header */}
                <section className="bg-black py-16 px-6 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">
                            BEYOND THE <span className="text-gray-400">PITCH</span>
                        </h1>
                        <p className="text-white max-w-xl mx-auto">
                            VESTRA isn’t just a store — it’s a tribute to the beautiful game,
                            connecting die-hard fans with premium football culture.
                        </p>
                    </div>
                </section>


                {/* Brand Mission Cards */}
                <section className="py-20 px-10 max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-30">
                        {[
                            {
                                title: "Our Mission",
                                desc: "Equipping every supporter with high-performance kits without the premium price tag.",
                                // icon: <Target className="w-8 h-8" />,
                                color: "bg-blue-50 text-blue-600"
                            },
                            {
                                title: "Our Passion",
                                desc: "We live for the 90th-minute goals and the terrace chants. Football is our universal language.",
                                // icon: <Heart className="w-8 h-8" />,
                                color: "bg-red-50 text-red-600"
                            },
                            {
                                title: "Why VESTRA",
                                desc: "Obsessive attention to detail, from the stitching of the crest to the breathability of the fabric.",
                                // icon: <ShieldCheck className="w-8 h-8" />,
                                color: "bg-green-50 text-green-600"
                            }
                        ].map((item, index) => (
                            <div key={index} className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <h2 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h2>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats / Numbers Section */}
                <section className="bg-gray-50 py-16 border-y border-gray-100">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-black text-black">50+</p>
                            <p className="text-sm text-gray-500 uppercase tracking-widest mt-1 font-bold">Leagues</p>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-black">10k+</p>
                            <p className="text-sm text-gray-500 uppercase tracking-widest mt-1 font-bold">Happy Fans</p>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-black">24/7</p>
                            <p className="text-sm text-gray-500 uppercase tracking-widest mt-1 font-bold">Support</p>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-black">Fast</p>
                            <p className="text-sm text-gray-500 uppercase tracking-widest mt-1 font-bold">Global Shipping</p>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 px-6 text-center">
                    <div className="max-w-2xl mx-auto bg-black rounded-[1rem] p-12 md:p-20 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Trophy size={120} />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to represent?</h2>
                        <p className="text-gray-400 mb-10 text-lg">
                            Join the VESTRA family today and wear your colors with pride.
                        </p>
                        <div className="flex justify-center">
                            <button
                                onClick={() => navigate("/products")}
                                className="flex items-center gap-2 bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Explore Collection <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default About;