
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet
} from "react-native";

import HotelCard from "../components/HotelCard";
import { hotels } from "../data/hotels";
import { useFavorites } from "../context/FavoritesContext";

export default function FavoritesScreen({ navigation }) {
  const { favorites, toggleFavorite } = useFavorites();

  const favoriteHotels = hotels.filter((hotel) =>
    favorites.includes(hotel.id)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis favoritos ❤️</Text>

      <FlatList
        data={favoriteHotels}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Todavía no guardaste hoteles favoritos.
          </Text>
        }
        renderItem={({ item }) => (
          <HotelCard
            hotel={item}
            favorite={true}
            onFavorite={() => toggleFavorite(item.id)}
            onPress={() =>
              navigation.navigate("HotelDetail", {
                hotelId: item.id
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    paddingTop: 55,
    backgroundColor: "#F5F7FC"
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#2457C5",
    marginBottom: 20
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#888"
  }
});
