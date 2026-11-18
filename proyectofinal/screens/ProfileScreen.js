import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import CustomButton from "../components/CustomButton";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const executeLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo cerrar sesión.");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("¿Querés salir de HotelGo?");
      if (confirmed) {
        executeLogout();
      }
      return;
    }

    Alert.alert("Cerrar sesión", "¿Querés salir de HotelGo?", [
      {
        text: "Cancelar",
        style: "cancel"
      },
      {
        text: "Salir",
        style: "destructive",
        onPress: executeLogout
      }
    ]);
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Usuario";

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HotelGo</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.options}>
        <CustomButton
          title="❤️ Mis favoritos"
          onPress={() => navigation.navigate("Favorites")}
        />
        <CustomButton
          title="📅 Mis reservas"
          onPress={() => navigation.navigate("Reservations")}
        />
        <CustomButton
          title="🗺️ Explorar mapa"
          onPress={() => navigation.navigate("Map")}
        />
        <CustomButton
          title="Cerrar sesión"
          color="#DC4444"
          loading={loggingOut}
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 25,
    paddingTop: 65,
    backgroundColor: "#F5F7FC"
  },
  logo: {
    fontSize: 30,
    color: "#2457C5",
    fontWeight: "bold"
  },
  avatar: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "#2457C5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35
  },
  avatarText: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold"
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 18
  },
  email: {
    color: "#888",
    marginTop: 5
  },
  options: {
    width: "100%",
    marginTop: 35
  }
});