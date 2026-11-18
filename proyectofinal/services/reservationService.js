import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const RESERVATIONS_KEY = "@hotelgo_reservations_persist";

export const createReservation = async (user, reservation) => {
  const userId = user?.id ? String(user.id) : "guest";
  const userEmail = user?.email ? String(user.email).toLowerCase().trim() : "guest";

  const newReservation = {
    id: Date.now().toString(),
    user_id: userId,
    user_email: userEmail,
    hotel_id: String(reservation.hotelId),
    hotel_name: reservation.hotelName,
    city: reservation.city,
    country: reservation.country,
    check_in: reservation.checkIn,
    check_out: reservation.checkOut,
    guests: reservation.guests,
    total: reservation.total,
    currency: reservation.currency || "ARS",
    status: "Confirmada",
    created_at: new Date().toISOString()
  };

  try {
    const stored = await AsyncStorage.getItem(RESERVATIONS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    const updatedList = [newReservation, ...list];
    await AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify(updatedList));
  } catch (storageError) {
    throw new Error("No se pudo guardar la reserva en el almacenamiento local.");
  }

  // Respaldo opcional en Supabase (no bloquea si falla)
  try {
    if (user?.id) {
      await supabase.from("reservations").insert({
        user_id: user.id,
        hotel_id: reservation.hotelId,
        hotel_name: reservation.hotelName,
        city: reservation.city,
        country: reservation.country,
        check_in: reservation.checkIn,
        check_out: reservation.checkOut,
        guests: reservation.guests,
        total: reservation.total,
        currency: reservation.currency,
        status: "Confirmada"
      });
    }
  } catch (e) {
    console.log("Respaldo en nube omitido.");
  }

  return newReservation;
};

export const getReservations = async (user) => {
  try {
    const stored = await AsyncStorage.getItem(RESERVATIONS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(list)) return [];

    if (!user) return list;

    const targetId = user.id ? String(user.id) : "";
    const targetEmail = user.email ? String(user.email).toLowerCase().trim() : "";

    return list.filter(
      (item) =>
        (targetId !== "" && String(item.user_id) === targetId) ||
        (targetEmail !== "" && String(item.user_email) === targetEmail)
    );
  } catch (error) {
    console.log("Error leyendo reservas:", error);
    return [];
  }
};

export const deleteReservation = async (reservationId) => {
  const stored = await AsyncStorage.getItem(RESERVATIONS_KEY);
  const list = stored ? JSON.parse(stored) : [];
  const filtered = list.filter((item) => String(item.id) !== String(reservationId));
  await AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify(filtered));
};
