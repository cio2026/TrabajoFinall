
import { supabase } from "./supabase";

export const getFavorites = async (userId) => {
  const { data, error } = await supabase
    .from("favorites")
    .select("hotel_id")
    .eq("user_id", userId);

  if (error) throw error;

  const result = [];

  for (const item of data) {
    result.push(item.hotel_id);
  }

  return result;
};

export const addFavorite = async (userId, hotelId) => {
  const { error } = await supabase
    .from("favorites")
    .insert({
      user_id: userId,
      hotel_id: hotelId
    });

  if (error) throw error;
};

export const removeFavorite = async (userId, hotelId) => {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("hotel_id", hotelId);

  if (error) throw error;
};
