import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  Platform
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import {
  getReservations,
  deleteReservation
} from "../services/reservationService";

export default function ReservationsScreen() {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getReservations(user);
      setReservations(result);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isFocused) {
      loadReservations();
    }
  }, [isFocused, loadReservations]);

  const handleCancel = async (id) => {
    if (Platform.OS === "web") {
      if (window.confirm("¿Querés eliminar esta reserva?")) {
        await deleteReservation(id);
        loadReservations();
      }
      return;
    }

    Alert.alert("Cancelar reserva", "¿Querés eliminar esta reserva?", [
      { text: "No", style: "cancel" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: async () => {
          await deleteReservation(id);
          loadReservations();
        }
      }
    ]);
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
      <Text style={styles.title}>Mis reservas ({reservations.length})</Text>
      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.empty}>Todavía no tenés reservas guardadas.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.hotel}>{item.hotel_name}</Text>
            <Text style={styles.text}>
              📍 {item.city}, {item.country}
            </Text>
            <Text style={styles.text}>📅 Entrada: {item.check_in}</Text>
            <Text style={styles.text}>📅 Salida: {item.check_out}</Text>
            <Text style={styles.text}>👥 Huéspedes: {item.guests}</Text>
            <Text style={styles.price}>
              Total: ${Number(item.total).toLocaleString("es-AR")}{" "}
              {item.currency}
            </Text>
            <View style={styles.footerRow}>
              <Text style={styles.status}>Estado: {item.status}</Text>
              <Pressable onPress={() => handleCancel(item.id)}>
                <Text style={styles.cancelText}>Cancelar reserva</Text>
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
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2
  },
  hotel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#202938"
  },
  text: {
    color: "#666",
    marginTop: 6
  },
  price: {
    color: "#2457C5",
    fontWeight: "bold",
    marginTop: 12,
    fontSize: 16
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F2F7"
  },
  status: {
    color: "#16A36A",
    fontWeight: "bold"
  },
  cancelText: {
    color: "#DC4444",
    fontWeight: "bold",
    fontSize: 13
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#888"
  }
});
