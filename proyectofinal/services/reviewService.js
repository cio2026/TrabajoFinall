import AsyncStorage from "@react-native-async-storage/async-storage";

const REVIEWS_KEY = "@hotelgo_reviews_persist";

export const getReviewsByHotel = async (hotelId) => {
  try {
    const stored = await AsyncStorage.getItem(REVIEWS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(list)) return [];
    return list.filter((r) => String(r.hotelId) === String(hotelId));
  } catch (error) {
    console.log("Error leyendo reseñas del hotel:", error);
    return [];
  }
};

export const getUserReviews = async (user) => {
  try {
    const stored = await AsyncStorage.getItem(REVIEWS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(list) || !user) return [];

    const targetId = user.id ? String(user.id) : "";
    const targetEmail = user.email ? String(user.email).toLowerCase().trim() : "";

    return list.filter(
      (r) =>
        (targetId !== "" && String(r.userId) === targetId) ||
        (targetEmail !== "" && String(r.userEmail) === targetEmail)
    );
  } catch (error) {
    console.log("Error leyendo reseñas del usuario:", error);
    return [];
  }
};

export const addReview = async ({
  user,
  hotelId,
  hotelName,
  userName,
  rating,
  comment
}) => {
  const userId = user?.id ? String(user.id) : "guest";
  const userEmail = user?.email ? String(user.email).toLowerCase().trim() : "guest";

  const newReview = {
    id: Date.now().toString(),
    userId,
    userEmail,
    hotelId: String(hotelId),
    hotelName: hotelName || "Hotel",
    userName: userName || "Viajero",
    rating: Number(rating) || 5,
    comment: comment.trim(),
    date: new Date().toLocaleDateString("es-AR")
  };

  try {
    const stored = await AsyncStorage.getItem(REVIEWS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [newReview, ...list];
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    return updated.filter((r) => String(r.hotelId) === String(hotelId));
  } catch (error) {
    throw new Error("No se pudo guardar la reseña en el dispositivo.");
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const stored = await AsyncStorage.getItem(REVIEWS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    const filtered = list.filter((item) => String(item.id) !== String(reviewId));
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.log("Error eliminando reseña:", error);
  }
};