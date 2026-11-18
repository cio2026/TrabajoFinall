import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert
} from "react-native";
import { hotels } from "../data/hotels";
import { useFavorites } from "../context/FavoritesContext";

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const { favorites, toggleFavorite } = useFavorites();

  const filteredHotels = hotels.filter((hotel) => {
    const searchText = search.toLowerCase();
    return (
      (hotel.name || "").toLowerCase().includes(searchText) ||
      (hotel.city || "").toLowerCase().includes(searchText) ||
      (hotel.country || "").toLowerCase().includes(searchText)
    );
  });

  const openHotel = (hotel) => {
    navigation.navigate("HotelDetail", {
      hotelId: hotel.id,
      hotel: hotel
    });
  };

  const handleToggleFavorite = async (hotel) => {
    try {
      await toggleFavorite(hotel.id);
    } catch (error) {
      Alert.alert(
        "Favoritos",
        error.message || "No se pudo actualizar el favorito."
      );
    }
  };

  const renderHotel = (hotel) => {
    const price = Number(hotel.price ?? hotel.precio ?? 0);
    const isFavorite = favorites.includes(hotel.id);

    return (
      <View key={hotel.id} style={styles.hotelCard}>
        <Pressable onPress={() => openHotel(hotel)}>
          {hotel.image ? (
            <Image source={{ uri: hotel.image }} style={styles.hotelImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>🏨 HotelGo</Text>
            </View>
          )}
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>
              {hotel.name || "Hotel sin nombre"}
            </Text>
            <Text style={styles.hotelLocation}>
              📍 {hotel.city || "Ciudad no disponible"},{" "}
              {hotel.country || "País no disponible"}
            </Text>
            <Text style={styles.hotelRating}>
              ⭐ {hotel.rating ?? "Sin calificación"}
            </Text>
            <Text style={styles.hotelPrice}>
              ${price.toLocaleString("es-AR")} por noche
            </Text>
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => handleToggleFavorite(hotel)}
          >
            <Text style={styles.favoriteText}>
              {isFavorite ? "❤️ Favorito" : "🤍 Favorito"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.detailButton}
            onPress={() => openHotel(hotel)}
          >
            <Text style={styles.detailButtonText}>Reservar</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>HotelGo</Text>
            <Text style={styles.welcome}>
              ¡Hola! Bienvenido a tu próximo viaje.
            </Text>
          </View>
          <Pressable
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.profileText}>👤</Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar hoteles, ciudades o países..."
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Hoteles cerca tuyo</Text>
          <Text style={styles.bannerSubtitle}>
            Usá el GPS de tu dispositivo para calcular distancias.
          </Text>
          <Pressable
            style={styles.bannerButton}
            onPress={() => navigation.navigate("Map")}
          >
            <Text style={styles.bannerButtonText}>USAR GPS</Text>
          </Pressable>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickButton}
            onPress={() => navigation.navigate("Favorites")}
          >
            <Text style={styles.quickIcon}>❤️</Text>
            <Text style={styles.quickText}>Favoritos</Text>
          </Pressable>

          <Pressable
            style={styles.quickButton}
            onPress={() => navigation.navigate("Reservations")}
          >
            <Text style={styles.quickIcon}>📅</Text>
            <Text style={styles.quickText}>Reservas</Text>
          </Pressable>

          <Pressable
            style={styles.quickButton}
            onPress={() => navigation.navigate("Map")}
          >
            <Text style={styles.quickIcon}>📡</Text>
            <Text style={styles.quickText}>Cercanos</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoteles disponibles</Text>
          <Text style={styles.hotelCount}>
            {filteredHotels.length} alojamientos
          </Text>
        </View>

        {filteredHotels.length > 0 ? (
          filteredHotels.map((hotel) => renderHotel(hotel))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏨</Text>
            <Text style={styles.emptyText}>No encontramos hoteles.</Text>
            <Text style={styles.emptySubtitle}>
              Probá con otra ciudad o destino.
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>HotelGo</Text>
          <Text style={styles.footerText}>Descubrí. Viajá. Disfrutá.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FA"
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2457C5"
  },
  welcome: {
    color: "#777777",
    marginTop: 5,
    fontSize: 13
  },
  profileButton: {
    backgroundColor: "#EAF0FF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  profileText: {
    fontSize: 23
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    margin: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E8F0"
  },
  searchIcon: {
    fontSize: 18
  },
  searchInput: {
    flex: 1,
    padding: 15,
    fontSize: 14
  },
  banner: {
    backgroundColor: "#2457C5",
    marginHorizontal: 18,
    padding: 22,
    borderRadius: 18
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold"
  },
  bannerSubtitle: {
    color: "#E0E9FF",
    marginTop: 8,
    marginBottom: 18
  },
  bannerButton: {
    backgroundColor: "#FFFFFF",
    padding: 13,
    borderRadius: 10,
    alignSelf: "flex-start"
  },
  bannerButtonText: {
    color: "#2457C5",
    fontWeight: "bold"
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 22,
    paddingHorizontal: 10
  },
  quickButton: {
    backgroundColor: "#FFFFFF",
    width: "29%",
    paddingVertical: 16,
    borderRadius: 13,
    alignItems: "center"
  },
  quickIcon: {
    fontSize: 23
  },
  quickText: {
    color: "#333333",
    fontWeight: "bold",
    marginTop: 7,
    fontSize: 12
  },
  sectionHeader: {
    paddingHorizontal: 18,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#222222"
  },
  hotelCount: {
    color: "#2457C5",
    fontSize: 12
  },
  hotelCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3
  },
  hotelImage: {
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
    color: "#2457C5",
    fontSize: 23,
    fontWeight: "bold"
  },
  hotelInfo: {
    padding: 15
  },
  hotelName: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#2457C5"
  },
  hotelLocation: {
    color: "#777777",
    marginTop: 7
  },
  hotelRating: {
    color: "#E5A000",
    marginTop: 8
  },
  hotelPrice: {
    color: "#16A36A",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 10
  },
  favoriteButton: {
    flex: 1,
    backgroundColor: "#FFF0F0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  favoriteText: {
    color: "#D94A4A",
    fontWeight: "bold",
    fontSize: 12
  },
  detailButton: {
    flex: 1,
    backgroundColor: "#2457C5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  detailButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12
  },
  emptyContainer: {
    alignItems: "center",
    padding: 35
  },
  emptyIcon: {
    fontSize: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10
  },
  emptySubtitle: {
    color: "#777777",
    marginTop: 5
  },
  footer: {
    alignItems: "center",
    padding: 30
  },
  footerLogo: {
    color: "#2457C5",
    fontSize: 23,
    fontWeight: "bold"
  },
  footerText: {
    color: "#888888",
    marginTop: 5
  }
});
