import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import api from "../api/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }

      try {
        const res = await api.get("/user/cart"); // ← no BASE_URL, no withCredentials
        const cartItems = res.data?.data?.Items || [];
        const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(totalQuantity);
      } catch (err) {
        console.error("Error loading cart:", err.response?.data || err);
        setCartCount(0);
      }
    };

    fetchCart();
  }, [user]);

  const updateCartCount = (newCount) => setCartCount(newCount);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);