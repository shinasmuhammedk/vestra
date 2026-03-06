import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../../api/api';

const TopProducts = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/products'),
      ]);

      const orders = ordersRes.data.data || ordersRes.data;
      const products = productsRes.data.data || productsRes.data;

      const productSales = products.map(product => {
        const salesCount = orders.reduce((count, order) => {
          const productInOrder = (order.items || order.products || []).find(
            p => p.product_id === product.id || p.id === product.id
          );
          const quantity = productInOrder ? (Number(productInOrder.quantity) || 1) : 0;
          return count + quantity;
        }, 0);

        const price = Number(product.price) || 0;

        return {
          ...product,
          sales: salesCount,
          revenue: salesCount * price,
        };
      });

      const sortedTopProducts = productSales
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 4);

      setTopProducts(sortedTopProducts);
    } catch (error) {
      console.error('Error fetching top products:', error);
      setError('Failed to load top products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-md mx-auto transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Top Products</h3>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center gap-2 text-red-600 py-4">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && topProducts.length === 0 && (
        <div className="text-center text-gray-500 py-4">No products available</div>
      )}

      {!isLoading && !error && topProducts.length > 0 && (
        <div className="space-y-4">
          {topProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <img
                  src={product.image_url || product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/fallback-image.jpg';
                    e.target.onerror = null;
                  }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.league}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  ₹{product.revenue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp size={14} className="text-green-500" />
                  <span className="text-xs text-green-600">{product.sales} sales</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopProducts;