import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getUserReviews, deleteReview } from "../services/reviewService";
import { hotels } from "../data/hotels";

export default function MyReviewsScreen({ navigation }) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserReviews(user);
      setReviews(data);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isFocused) {
      loadReviews();
    }
  }, [isFocused, loadReviews]);

  const handleDelete = async (id) => {
    if (Platform.OS === "web") {
      if (window.confirm("¿Querés eliminar esta reseña?")) {
        await deleteReview(id);
        loadReviews();
      }
      return;
    }

    Alert.alert("Eliminar reseña", "¿Querés borrar esta reseña?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteReview(id);
          loadReviews();
        }
      }
    ]);
  };

  const getHotelTitle = (item) => {
    if (item.hotelName && item.hotelName !== "Hotel") return item.hotelName;
    const found = hotels.find((h) => String(h.id) === String(item.hotelId));
    return found ? found.name : "Hotel";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2457C5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis reseñas ({reviews.length})</Text>

      <FlatList
        data={reviews}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Todavía no publicaste ninguna reseña. Entrá a un hotel y dejá tu opinión.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.hotelName}>{getHotelTitle(item)}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>

            <Text style={styles.stars}>
              {"⭐".repeat(item.rating)} ({item.rating}/5)
            </Text>

            <Text style={styles.comment}>{item.comment}</Text>

            <View style={styles.actionsRow}>
              <Pressable
                onPress={() =>
                  navigation.navigate("HotelDetail", { hotelId: item.hotelId })
                }
              >
                <Text style={styles.linkText}>Ver hotel →</Text>
              </Pressable>

              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    paddingTop: 20,
    backgroundColor: "#F5F7FC"
  },
  center: {
    flex: 1,
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2457C5",
    marginBottom: 18
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#888",
    paddingHorizontal: 20,
    lineHeight: 20
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  hotelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#202938",
    flex: 1
  },
  date: {
    fontSize: 12,
    color: "#888"
  },
  stars: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#D97706",
    marginBottom: 8
  },
  comment: {
    color: "#444",
    lineHeight: 20,
    marginBottom: 12
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F7",
    paddingTop: 10
  },
  linkText: {
    color: "#2457C5",
    fontWeight: "bold",
    fontSize: 13
  },
  deleteText: {
    color: "#DC4444",
    fontWeight: "bold",
    fontSize: 13
  }
});