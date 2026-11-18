import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Pressable,
  Platform
} from "react-native";
import { WebView } from "react-native-webview";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomButton from "../components/CustomButton";
import { hotels } from "../data/hotels";
import { createReservation } from "../services/reservationService";
import { getReviewsByHotel, addReview } from "../services/reviewService";
import { useAuth } from "../context/AuthContext";

export default function HotelDetailScreen({ route, navigation }) {
  const hotel =
    route.params?.hotel ||
    hotels.find((h) => String(h.id) === String(route.params?.hotelId));

  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
  const [guests, setGuests] = useState(2);
  const [picker, setPicker] = useState("");
  const [reservationSaved, setReservationSaved] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaved, setReviewSaved] = useState(false);

  useEffect(() => {
    if (hotel?.id) {
      getReviewsByHotel(hotel.id).then(setReviews);
    }
  }, [hotel?.id]);

  if (!hotel) {
    return (
      <View style={styles.center}>
        <Text>Hotel no encontrado.</Text>
      </View>
    );
  }

  const days = Math.max(1, Math.ceil((checkOut - checkIn) / 86400000));
  const hasCoordinates =
    typeof hotel.latitude === "number" && typeof hotel.longitude === "number";

  const safeHotelName = (hotel.name || "").replace(/"/g, '\\"');
  const safeHotelAddress = (hotel.address || hotel.city || "").replace(
    /"/g,
    '\\"'
  );

  const mapHtml = hasCoordinates
    ? `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${hotel.latitude},${hotel.longitude}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);
          L.marker([${hotel.latitude},${hotel.longitude}])
            .addTo(map)
            .bindPopup("<b>${safeHotelName}</b><br>${safeHotelAddress}")
            .openPopup();
        </script>
      </body>
      </html>
    `
    : "";

  const handleDate = (event, selectedDate) => {
    setPicker("");
    if (event.type === "dismissed" || !selectedDate) return;

    if (picker === "in") {
      setCheckIn(selectedDate);
      if (selectedDate >= checkOut) {
        setCheckOut(new Date(selectedDate.getTime() + 86400000));
      }
    } else if (picker === "out") {
      if (selectedDate <= checkIn) {
        Alert.alert(
          "Fecha inválida",
          "La salida debe ser posterior al ingreso."
        );
        return;
      }
      setCheckOut(selectedDate);
    }
  };

  const handleReservation = async () => {
    if (!user) {
      Alert.alert("Atención", "Iniciá sesión para reservar.");
      return;
    }

    try {
      await createReservation(user, {
        hotelId: hotel.id,
        hotelName: hotel.name,
        city: hotel.city,
        country: hotel.country,
        guests,
        checkIn: checkIn.toISOString().slice(0, 10),
        checkOut: checkOut.toISOString().slice(0, 10),
        total: hotel.price * days,
        currency: hotel.currency || "ARS"
      });

      setReservationSaved(true);

      if (Platform.OS !== "web") {
        Alert.alert(
          "¡Reserva guardada!",
          "Tu reserva quedó guardada en 'Mis reservas'.",
          [
            { text: "Seguir acá", style: "cancel" },
            {
              text: "Ver mis reservas",
              onPress: () =>
                navigation.navigate("MainDrawer", { screen: "Reservations" })
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAddReview = async () => {
    if (!user) {
      Alert.alert("Atención", "Iniciá sesión para publicar una reseña.");
      return;
    }

    if (!reviewComment.trim()) {
      Alert.alert("Reseña vacía", "Escribí un comentario antes de publicar.");
      return;
    }

    try {
      const userName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email?.split("@")[0] ||
        "Huésped";

      const updatedReviews = await addReview({
        user,
        hotelId: hotel.id,
        hotelName: hotel.name,
        userName,
        rating: reviewRating,
        comment: reviewComment
      });

      setReviews(updatedReviews);
      setReviewComment("");
      setReviewRating(5);
      setReviewSaved(true);

      if (Platform.OS !== "web") {
        Alert.alert(
          "¡Reseña guardada!",
          "Tu reseña quedó guardada en 'Mis reseñas'.",
          [
            { text: "Seguir acá", style: "cancel" },
            {
              text: "Ver mis reseñas",
              onPress: () =>
                navigation.navigate("MainDrawer", { screen: "MyReviews" })
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {hotel.image ? (
        <Image source={{ uri: hotel.image }} style={styles.image} />
      ) : null}

      <View style={styles.content}>
        <Text style={styles.title}>{hotel.name}</Text>
        <Text style={styles.location}>
          📍 {hotel.address ? `${hotel.address} - ` : ""}
          {hotel.city}, {hotel.country}
        </Text>
        <Text style={styles.rating}>⭐ {hotel.rating}</Text>
        <Text style={styles.description}>{hotel.description}</Text>

        {hotel.services && (
          <>
            <Text style={styles.heading}>Servicios</Text>
            <Text style={styles.servicesText}>
              {hotel.services.join(" • ")}
            </Text>
          </>
        )}

        <Text style={styles.heading}>Ubicación en el mapa</Text>
        {hasCoordinates ? (
          <View style={styles.mapContainer}>
            <WebView
              style={styles.map}
              originWhitelist={["*"]}
              source={{ html: mapHtml }}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <Text style={styles.noMap}>Coordenadas no disponibles.</Text>
        )}

        <Text style={styles.heading}>Fechas de estadía</Text>
        <CustomButton
          title={"Entrada: " + checkIn.toLocaleDateString()}
          onPress={() => setPicker("in")}
        />
        <CustomButton
          title={"Salida: " + checkOut.toLocaleDateString()}
          onPress={() => setPicker("out")}
        />

        {picker !== "" && (
          <DateTimePicker
            value={picker === "in" ? checkIn : checkOut}
            mode="date"
            minimumDate={
              picker === "in"
                ? new Date()
                : new Date(checkIn.getTime() + 86400000)
            }
            onChange={handleDate}
          />
        )}

        <Text style={styles.heading}>Huéspedes</Text>
        <View style={styles.guests}>
          <CustomButton
            title="-"
            onPress={() => setGuests(Math.max(1, guests - 1))}
          />
          <Text style={styles.guestText}>{guests}</Text>
          <CustomButton
            title="+"
            onPress={() => setGuests(Math.min(10, guests + 1))}
          />
        </View>

        <Text style={styles.total}>
          Total estimado: ${(hotel.price * days).toLocaleString("es-AR")}{" "}
          {hotel.currency || "ARS"}
        </Text>

        <CustomButton title="Solicitar reserva" onPress={handleReservation} />

        {reservationSaved && (
          <View style={styles.savedBanner}>
            <Text style={styles.savedText}>
              ✅ ¡Reserva guardada correctamente!
            </Text>
            <CustomButton
              title="Ir a Mis reservas"
              color="#16A36A"
              onPress={() =>
                navigation.navigate("MainDrawer", { screen: "Reservations" })
              }
            />
          </View>
        )}

        <Text style={styles.heading}>
          Reseñas de huéspedes ({reviews.length})
        </Text>
        <View style={styles.reviewBox}>
          <Text style={styles.reviewLabel}>Tu calificación:</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setReviewRating(star)}
                style={[
                  styles.starButton,
                  reviewRating >= star && styles.starSelected
                ]}
              >
                <Text style={styles.starText}>⭐ {star}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={styles.reviewInput}
            placeholder="Contá tu experiencia en este hotel..."
            value={reviewComment}
            onChangeText={setReviewComment}
            multiline
          />

          <CustomButton
            title="Publicar reseña"
            color="#16A36A"
            onPress={handleAddReview}
          />

          {reviewSaved && (
            <View style={styles.savedBanner}>
              <Text style={styles.savedText}>
                ✅ ¡Reseña guardada correctamente!
              </Text>
              <CustomButton
                title="Ir a Mis reseñas"
                color="#2457C5"
                onPress={() =>
                  navigation.navigate("MainDrawer", { screen: "MyReviews" })
                }
              />
            </View>
          )}
        </View>

        {reviews.length === 0 ? (
          <Text style={styles.emptyReviews}>
            Todavía no hay reseñas. ¡Sé el primero en opinar!
          </Text>
        ) : (
          reviews.map((item) => (
            <View key={item.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{item.userName}</Text>
                <Text style={styles.reviewDate}>{item.date}</Text>
              </View>
              <Text style={styles.reviewStars}>
                {"⭐".repeat(item.rating)} ({item.rating}/5)
              </Text>
              <Text style={styles.reviewText}>{item.comment}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FC"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: "100%",
    height: 260
  },
  content: {
    padding: 20,
    paddingBottom: 50
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#202938"
  },
  location: {
    color: "#666",
    marginTop: 6
  },
  rating: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#E5A000"
  },
  description: {
    marginTop: 15,
    lineHeight: 22,
    color: "#444"
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 10,
    color: "#2457C5"
  },
  servicesText: {
    color: "#555"
  },
  mapContainer: {
    borderRadius: 15,
    overflow: "hidden",
    elevation: 2,
    height: 220
  },
  map: {
    width: "100%",
    height: 220
  },
  noMap: {
    color: "#888",
    fontStyle: "italic"
  },
  guests: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15
  },
  guestText: {
    fontSize: 20,
    fontWeight: "bold"
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2457C5",
    marginTop: 25,
    marginBottom: 10
  },
  savedBanner: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#16A36A",
    borderRadius: 12,
    padding: 14,
    marginTop: 12
  },
  savedText: {
    color: "#15803D",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6
  },
  reviewBox: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2
  },
  reviewLabel: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  starButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#F1F3F8"
  },
  starSelected: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B"
  },
  starText: {
    fontWeight: "bold",
    fontSize: 12
  },
  reviewInput: {
    backgroundColor: "#F5F7FC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    minHeight: 75,
    textAlignVertical: "top",
    marginBottom: 10
  },
  emptyReviews: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8ECF3"
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  reviewAuthor: {
    fontWeight: "bold",
    color: "#2457C5"
  },
  reviewDate: {
    fontSize: 12,
    color: "#888"
  },
  reviewStars: {
    fontSize: 12,
    marginBottom: 6,
    color: "#D97706",
    fontWeight: "bold"
  },
  reviewText: {
    color: "#333",
    lineHeight: 20
  }
});