
import { supabase } from "./supabase";

export async function getHotels() {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getHotelById(id) {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getHotelsByCountry(country) {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("country", country)
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw error;
  }

  return data || [];
}
