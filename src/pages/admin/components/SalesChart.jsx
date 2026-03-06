import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../../api/api";

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const res = await api.get("/admin/orders");
      const orders = res.data.data || res.data;

      const dailySales = {};

      orders.forEach((order) => {
        const day = new Date(order.created_at).toLocaleDateString("default", {
          day: "numeric",
          month: "short",
        });

        const revenue = Number(order.total_amount || 0);
        const itemsSold = (order.items || []).reduce(
          (sum, i) => sum + (i.quantity || 1),
          0
        );

        if (!dailySales[day]) {
          dailySales[day] = { revenue: 0, sales: 0 };
        }

        dailySales[day].revenue += revenue;
        dailySales[day].sales += itemsSold;
      });

      const chartData = Object.entries(dailySales)
        .map(([day, val]) => ({
          day,
          revenue: Number(val.revenue.toFixed(2)),
          sales: val.sales,
        }))
        .sort((a, b) => new Date(a.day) - new Date(b.day));

      setSalesData(chartData);
    } catch (err) {
      console.error("Sales analytics error:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-6">Daily Sales Analytics</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip
              formatter={(value, name) =>
                name === "revenue"
                  ? [`₹${value.toLocaleString()}`, "Revenue"]
                  : [value, "Items Sold"]
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;