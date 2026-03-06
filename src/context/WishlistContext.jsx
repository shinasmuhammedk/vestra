import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import api from "../api/api";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlistCount(0);
        return;
      }

      try {
        const res = await api.get("/user/wishlist"); // ← no BASE_URL, no withCredentials
        const items = res.data?.data || [];
        setWishlistCount(items.length);
      } catch (err) {
        console.error("Error fetching wishlist:", err.response?.data || err);
        setWishlistCount(0);
      }
    };

    fetchWishlist();
  }, [user]);

  const updateWishlistCount = (count) => setWishlistCount(count);

  return (
    <WishlistContext.Provider value={{ wishlistCount, updateWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);