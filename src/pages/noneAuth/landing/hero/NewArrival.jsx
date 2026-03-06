import React from 'react'
import { useNavigate } from 'react-router-dom';
import bgImg from "../../../../assets/bgImg.jpg";
import Button from '../../../../components/button/Button';

function NewArrival() {
    const navigate = useNavigate();

    function handleShopNow() {
        navigate("/products");
    }

    return (
        <section
            aria-labelledby="new-arrival-heading"
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background Image Container with Optimized Blur */}
            <div className="absolute inset-0">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${bgImg})`,
                        backgroundAttachment: 'fixed' // Adds parallax effect on scroll
                    }}
                    role="img"
                    aria-label="Football jersey background"
                />

                {/* Overlay with Gradient for Better Text Readability */}
                <div
                    className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"
                    aria-hidden="true"
                />

                {/* Subtle Blur Layer */}
                <div
                    className="absolute inset-0 backdrop-blur-sm"
                    aria-hidden="true"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Badge/Indicator */}
                    <div className="inline-flex items-center gap-2 mb-6">
                        <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                        <p className="text-sm uppercase tracking-[0.3em] font-semibold text-white/90">
                            New Arrivals
                        </p>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 text-center text-white px-6">
                        {/* <p className="text-sm uppercase tracking-widest">New Arrivals</p> */}

                        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mt-2">
                            THE NEW <br /> 2025/26 JERSEYS
                        </h1>

                        {/* <p className="mt-4 text-lg font-medium">
          Get <span className="font-bold">10% OFF</span> for your first order
        </p> */}

                        {/* <button onClick={handleShopNow} className="mt-6 bg-white text-black px-8 py-3 font-semibold rounded-md shadow-lg hover:bg-gray-200 transition">
                        Shop Now
                    </button> */}
                        <Button className='mt-6' onClick={handleShopNow} variant='ghost' sizes='medium'>Shop Now</Button>
                    </div>

                    {/* Optional Subheading */}
                    <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto font-light tracking-wide">
                        Experience the future of football fashion with our latest collection
                    </p>

                    {/* Promotional Text (Optional) */}
                    {/* <div className="mb-10 inline-block bg-gradient-to-r from-white/10 to-transparent backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
                        <p className="text-lg font-medium text-white">
                            Get <span className="font-bold text-yellow-300">10% OFF</span> on your first order
                        </p>
                    </div> */}

                    {/* CTA Button with Animation
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse" />
                        <Button
                            onClick={handleShopNow}
                            variant="ghost"
                            size="large"
                            className="relative px-12 py-4 text-lg font-bold transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                            aria-label="Shop the new 2025/26 jersey collection"
                        >
                            <span className="flex items-center justify-center gap-3">
                                Shop Now
                                <svg
                                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                    />
                                </svg>
                            </span>
                        </Button>
                    </div> */}

                    {/* Scroll Indicator (Optional) */}
                    {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <svg
                            className="w-6 h-6 text-white/60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </div> */}
                </div>
            </div>

            {/* Decorative Elements (Optional) */}
            <div className="absolute top-1/4 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
        </section>
    )
}

export default NewArrival