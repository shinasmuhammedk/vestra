import { useNavigate } from "react-router-dom";
import { useState } from "react";
import eplLogo from "../../../../assets/leagues/epl.png";
import laLigaLogo from "../../../../assets/leagues/laliga.png";
import serieALogo from "../../../../assets/leagues/seriea.png";
import bundesligaLogo from "../../../../assets/leagues/bundesliga.png";
import ligue1Logo from "../../../../assets/leagues/ligue1.png";

function ShopByLeague() {
    const navigate = useNavigate();
    const [hoveredLeague, setHoveredLeague] = useState(null);

    const leagues = [
        { 
            name: "Premier League", 
            logo: eplLogo,
            color: "from-red-500 to-blue-500",
            bgColor: "bg-gradient-to-br from-red-50 to-blue-50",
            borderColor: "border-red-200",
            accentColor: "text-red-600"
        },
        { 
            name: "La Liga", 
            logo: laLigaLogo,
            color: "from-purple-500 to-yellow-500",
            bgColor: "bg-gradient-to-br from-purple-50 to-yellow-50",
            borderColor: "border-purple-200",
            accentColor: "text-purple-600"
        },
        { 
            name: "Serie A", 
            logo: serieALogo,
            color: "from-blue-500 to-green-500",
            bgColor: "bg-gradient-to-br from-blue-50 to-green-50",
            borderColor: "border-blue-200",
            accentColor: "text-blue-600"
        },
        { 
            name: "Bundesliga", 
            logo: bundesligaLogo,
            color: "from-red-500 to-black",
            bgColor: "bg-gradient-to-br from-red-50 to-gray-100",
            borderColor: "border-gray-300",
            accentColor: "text-gray-800"
        },
        { 
            name: "Ligue 1", 
            logo: ligue1Logo,
            color: "from-blue-500 to-red-500",
            bgColor: "bg-gradient-to-br from-blue-50 to-red-50",
            borderColor: "border-blue-200",
            accentColor: "text-blue-700"
        },
    ];

    const handleLeagueClick = (league) => {
        navigate(`/products?league=${encodeURIComponent(league.name)}`);
    };

    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center mb-4">
                        <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-4" />
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">League</span>
                        </h2>
                        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full ml-4" />
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Browse official jerseys from the world's top football leagues
                    </p>
                </div>

                {/* League Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
                    {leagues.map((league, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleLeagueClick(league)}
                            onMouseEnter={() => setHoveredLeague(idx)}
                            onMouseLeave={() => setHoveredLeague(null)}
                            className="relative group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
                        >
                            {/* Gradient Background Glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${league.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                            
                            {/* Main Card */}
                            <div className={`
                                relative z-10 h-full rounded-2xl p-6 
                                ${league.bgColor} border-2 ${league.borderColor}
                                shadow-lg hover:shadow-2xl transition-all duration-300
                                overflow-hidden
                            `}>
                                {/* Animated Background Pattern */}
                                <div className="absolute inset-0 opacity-5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-16 translate-x-16" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-current to-transparent rounded-full translate-y-16 -translate-x-16" />
                                </div>

                                {/* League Logo */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-white rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                                    <img
                                        src={league.logo}
                                        alt={`${league.name} logo`}
                                        className="relative h-28 w-28 mx-auto object-contain transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                        loading="lazy"
                                    />
                                </div>

                                {/* League Name */}
                                <h3 className={`text-xl font-bold mb-4 ${league.accentColor} transition-colors duration-300`}>
                                    {league.name}
                                </h3>

                                {/* Explore Button */}
                                <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <div className="inline-flex items-center justify-center px-4 py-2 bg-white rounded-full shadow-md">
                                        <span className="text-sm font-semibold text-gray-700">
                                            Explore
                                        </span>
                                        <svg 
                                            className="w-4 h-4 ml-2 text-gray-600 transform group-hover:translate-x-1 transition-transform"
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M14 5l7 7m0 0l-7 7m7-7H3" 
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Hover Indicator */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* League Stats Badge (Optional) */}
                            {/* <div className="absolute -top-2 -right-2 z-20">
                                <div className="px-3 py-1 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full shadow-lg">
                                    <span className="text-xs font-bold text-white">
                                        {idx + 1}
                                    </span>
                                </div>
                            </div> */}
                        </div>
                    ))}
                </div>

                {/* View All CTA */}
                <div className="text-center mt-16">
                    <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                        <span>View All Leagues</span>
                        <svg 
                            className="w-5 h-5 ml-2" 
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
                    </button>
                </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute left-0 top-1/4 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
            <div className="absolute right-0 bottom-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        </section>
    );
}

export default ShopByLeague;