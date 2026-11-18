
import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable
} from "react-native";

export default function HotelCard({ hotel, navigation }) {

  if (!hotel) {
    return null;
  }

  const price = Number(hotel.price ?? hotel.precio ?? 0);

  const formattedPrice = price.toLocaleString("es-AR");

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        if (navigation) {
          navigation.navigate("HotelDetail", {
            hotelId: hotel.id
          });
        }
      }}
    >
      {hotel.image ? (
        <Image
          source={{ uri: hotel.image }}
          style={styles.image}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>🏨 HotelGo</Text>
        </View>
      )}

      <View style={styles.info}>

        <Text style={styles.name}>
          {hotel.name || "Hotel sin nombre"}
        </Text>

        <Text style={styles.location}>
          📍 {hotel.city || "Ciudad no disponible"},{" "}
          {hotel.country || "País no disponible"}
        </Text>

        <Text style={styles.price}>
          ${formattedPrice} por noche
        </Text>

        <Text style={styles.rating}>
          ⭐ {hotel.rating ?? "Sin calificación"}
        </Text>

      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 18,
    overflow: "hidden",
    elevation: 3
  },
  image: {
    width: "100%",
    height: 190
  },
  imagePlaceholder: {
    height: 190,
    backgroundColor: "#DCE6FA",
    justifyContent: "center",
    alignItems: "center"
  },
  placeholderText: {
    fontSize: 22,
    color: "#2457C5",
    fontWeight: "bold"
  },
  info: {
    padding: 15
  },
  name: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#2457C5"
  },
  location: {
    color: "#777",
    marginTop: 7
  },
  price: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#16A36A",
    marginTop: 10
  },
  rating: {
    marginTop: 7,
    color: "#E5A000"
  }
});

