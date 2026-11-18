import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

export default function HotelMap({
  latitude,
  longitude,
  title,
  description,
  hotels = [],
  onSelectHotel,
  height = 240
}) {
  // MODO WEB (Vista previa de Expo Snack / Navegador)
  if (Platform.OS === "web") {
    const targetHotel = hotels.length > 0 ? hotels[0] : null;
    const lat = targetHotel ? targetHotel.latitude : latitude;
    const lng = targetHotel ? targetHotel.longitude : longitude;
    const placeName = targetHotel ? `${targetHotel.name}, ${targetHotel.city}` : title;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return (
        <View style={[styles.fallback, { height }]}>
          <Text style={styles.fallbackText}>Ubicación no disponible</Text>
        </View>
      );
    }

    // Si tiene el nombre del hotel, Google Maps marca el establecimiento real
    const query = placeName
      ? encodeURIComponent(placeName)
      : `${lat},${lng}`;

    const embedUrl = `https://maps.google.com/maps?q=${query}&z=16&output=embed`;

    return (
      <View style={[styles.webContainer, { height }]}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: 12 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </View>
    );
  }

  // MODO MÓVIL NATIVO (Android / iOS)
  const MapView = require("react-native-maps").default;
  const { Marker, Callout } = require("react-native-maps");

  if (hotels.length > 0) {
    const validHotels = hotels.filter(
      (h) => typeof h.latitude === "number" && typeof h.longitude === "number"
    );

    const initialRegion =
      validHotels.length > 0
        ? {
            latitude: validHotels[0].latitude,
            longitude: validHotels[0].longitude,
            latitudeDelta: 12,
            longitudeDelta: 12
          }
        : {
            latitude: -34.5875,
            longitude: -58.3886,
            latitudeDelta: 12,
            longitudeDelta: 12
          };

    return (
      <MapView style={[styles.map, { height }]} initialRegion={initialRegion}>
        {validHotels.map((hotel) => (
          <Marker
            key={hotel.id}
            coordinate={{
              latitude: hotel.latitude,
              longitude: hotel.longitude
            }}
            pinColor="#2457C5"
          >
            <Callout onPress={() => onSelectHotel && onSelectHotel(hotel)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{hotel.name}</Text>
                <Text style={styles.calloutCity}>
                  {hotel.city}, {hotel.country}
                </Text>
                <Text style={styles.calloutLink}>Ver detalle →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    );
  }

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return (
      <View style={[styles.fallback, { height }]}>
        <Text style={styles.fallbackText}>Coordenadas no disponibles</Text>
      </View>
    );
  }

  return (
    <MapView
      style={[styles.map, { height }]}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }}
    >
      <Marker
        coordinate={{ latitude, longitude }}
        title={title}
        description={description}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden"
  },
  map: {
    width: "100%",
    borderRadius: 12
  },
  fallback: {
    width: "100%",
    backgroundColor: "#E8ECF3",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  fallbackText: {
    color: "#666"
  },
  callout: {
    width: 170,
    padding: 4
  },
  calloutTitle: {
    fontWeight: "bold",
    color: "#2457C5"
  },
  calloutCity: {
    fontSize: 12,
    color: "#555"
  },
  calloutLink: {
    fontSize: 11,
    color: "#16A36A",
    fontWeight: "bold",
    marginTop: 4
  }
});