import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);
const FAVORITES_KEY = "@hotelgo_favorites";

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const key = user ? `${FAVORITES_KEY}_${user.id}` : FAVORITES_KEY;
        const stored = await AsyncStorage.getItem(key);
        setFavorites(stored ? JSON.parse(stored) : []);
      } catch (e) {
        console.log(e);
      }
    };
    loadFavorites();
  }, [user]);

  const toggleFavorite = async (hotelId) => {
    const key = user ? `${FAVORITES_KEY}_${user.id}` : FAVORITES_KEY;
    const exists = favorites.includes(hotelId);
    const updated = exists
      ? favorites.filter((id) => id !== hotelId)
      : [...favorites, hotelId];

    setFavorites(updated);
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
