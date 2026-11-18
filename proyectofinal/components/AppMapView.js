import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";

export default function AppMapView({
  hotels = [],
  userLocation = null,
  customPins = [],
  onMapPress = null,
  onSelectHotel = null,
  initialRegion = {
    latitude: -34.5875,
    longitude: -58.3886,
    latitudeDelta: 12,
    longitudeDelta: 12
  },
  style
}) {
  // Escucha los clics del mapa cuando se ejecuta en Web (Expo Snack)
  useEffect(() => {
    if (Platform.OS !== "web" || !onMapPress) return;

    const handleMessage = (event) => {
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.type === "MAP_PRESS") {
          onMapPress({
            nativeEvent: {
              coordinate: { latitude: data.lat, longitude: data.lng }
            }
          });
        }
      } catch (e) {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onMapPress]);

  // MODO WEB (Vista previa de Expo Snack)
  if (Platform.OS === "web") {
    const zoom = initialRegion.latitudeDelta < 1 ? 15 : 5;

    const hotelMarkers = hotels
      .filter((h) => typeof h.latitude === "number" && typeof h.longitude === "number")
      .map(
        (h) => `
        L.marker([${h.latitude}, ${h.longitude}])
          .addTo(map)
          .bindPopup("<b>${h.name.replace(/"/g, '\\"')}</b><br>${h.city}");
      `
      )
      .join("\n");

    const userMarker = userLocation
      ? `
        var uIcon = L.divIcon({
          html: '<div style="background:#DC4444;width:15px;height:15px;border-radius:50%;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>',
          className: ''
        });
        L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: uIcon })
          .addTo(map)
          .bindPopup("<b>📡 Tu ubicación GPS</b>");
      `
      : "";

    const customMarkers = customPins
      .map(
        (p) => `
        var gIcon = L.divIcon({
          html: '<div style="background:#16A36A;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.6);"></div>',
          className: ''
        });
        L.marker([${p.latitude}, ${p.longitude}], { icon: gIcon })
          .addTo(map)
          .bindPopup("<b>📌 ${p.title}</b><br>Lat: ${p.latitude.toFixed(4)}<br>Lng: ${p.longitude.toFixed(4)}");
      `
      )
      .join("\n");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }</style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${initialRegion.latitude}, ${initialRegion.longitude}], ${zoom});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);
          ${hotelMarkers}
          ${userMarker}
          ${customMarkers}
          map.on('click', function(e) {
            window.parent.postMessage(JSON.stringify({
              type: 'MAP_PRESS',
              lat: e.latlng.lat,
              lng: e.latlng.lng
            }), '*');
          });
        </script>
      </body>
      </html>
    `;

    return (
      <View style={[styles.webBox, style]}>
        <iframe
          srcDoc={html}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </View>
    );
  }

  // MODO MÓVIL NATIVO: Usa el componente MapView y Marker de react-native-maps
  const MapView = require("react-native-maps").default;
  const { Marker, Callout } = require("react-native-maps");

  return (
    <MapView
      style={style}
      showsUserLocation={true}
      showsMyLocationButton={true}
      onPress={onMapPress}
      initialRegion={initialRegion}
    >
      {hotels.map((hotel) => (
        <Marker
          key={hotel.id}
          coordinate={{
            latitude: hotel.latitude,
            longitude: hotel.longitude
          }}
          pinColor="#2457C5"
        >
          <Callout onPress={() => onSelectHotel && onSelectHotel(hotel)}>
            <View style={{ width: 160, padding: 4 }}>
              <Text style={{ fontWeight: "bold", color: "#2457C5" }}>
                {hotel.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#555" }}>{hotel.city}</Text>
            </View>
          </Callout>
        </Marker>
      ))}

      {customPins.map((pin) => (
        <Marker
          key={pin.id}
          coordinate={{
            latitude: pin.latitude,
            longitude: pin.longitude
          }}
          title={pin.title}
          description={`Lat: ${pin.latitude.toFixed(4)}, Lng: ${pin.longitude.toFixed(4)}`}
          pinColor="#16A36A"
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  webBox: {
    width: "100%",
    height: 300,
    overflow: "hidden"
  }
});