import axios from "axios";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Button from "../../../../components/button/Button";
import { useNavigate } from "react-router-dom";

export function MostSelling() {
  const [topProducts, setTopProducts] = useState([]);
  const navigate = useNavigate(); // add useNavigate

  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then((res) => {
        const bestSellers = res.data
          .filter((p) => p.topSelling === true) // only top-selling
          .slice(0, 4); // limit to 4
        setTopProducts(bestSellers);
      })
      .catch((err) => console.error("Error fetching top products:", err));
  }, []);

  // handle Buy Now
  const handleBuyNow = (productId) => {
    navigate(`/product/${productId}`); // navigate to product detail / buy now page
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Our Most Selling Jerseys
        </h2>
        <p className="text-gray-600 mb-12">
          Fans’ favorites – top jerseys loved by our community.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {topProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600">
                  {product.name}
                </h3>
                <p className="text-green-600 font-bold text-lg mt-1">
                  ₹{product.price}
                </p>

                {/* Rating */}
                <div className="flex justify-center mt-2 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>

                {/* Buy Now Button */}
                <Button
                  className="mt-5"
                  variant="danger"
                  size="small"
                  onClick={() => handleBuyNow(product.id)} // pass product id
                >
                  Buy Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MostSelling;
