import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";

export default function InteractiveMap({
  hotels = [],
  userLocation = null,
  selectedHotel = null,
  customPin = null,
  onMapPress = null,
  height = 300
}) {
  const centerLat = customPin
    ? customPin.latitude
    : selectedHotel
    ? selectedHotel.latitude
    : userLocation
    ? userLocation.latitude
    : hotels[0]?.latitude || -34.5875;

  const centerLng = customPin
    ? customPin.longitude
    : selectedHotel
    ? selectedHotel.longitude
    : userLocation
    ? userLocation.longitude
    : hotels[0]?.longitude || -58.3886;

  const zoomLevel = customPin || selectedHotel ? 14 : 5;

  // Escucha los clics del mapa cuando se ejecuta en navegador (Expo Snack Web)
  useEffect(() => {
    if (Platform.OS !== "web" || !onMapPress) return;

    const handleWindowMessage = (event) => {
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.type === "MAP_CLICK") {
          onMapPress({ latitude: data.lat, longitude: data.lng });
        }
      } catch (e) {}
    };

    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }, [onMapPress]);

  const markersJs = hotels
    .filter(
      (h) => typeof h.latitude === "number" && typeof h.longitude === "number"
    )
    .map(
      (h) => `
      L.marker([${h.latitude}, ${h.longitude}])
        .addTo(map)
        .bindPopup("<b>${h.name.replace(/"/g, '\\"')}</b><br>${h.city}");
    `
    )
    .join("\n");

  const userMarkerJs = userLocation
    ? `
      var userIcon = L.divIcon({
        html: '<div style="background:#DC4444;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>',
        className: ''
      });
      L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>📡 Tu ubicación GPS</b>");
    `
    : "";

  const customPinJs = customPin
    ? `
      var customIcon = L.divIcon({
        html: '<div style="background:#16A36A;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.6);"></div>',
        className: ''
      });
      customMarker = L.marker([${customPin.latitude}, ${customPin.longitude}], { icon: customIcon })
        .addTo(map)
        .bindPopup("<b>📌 Pin marcado</b><br>Lat: ${customPin.latitude.toFixed(4)}<br>Lng: ${customPin.longitude.toFixed(4)}")
        .openPopup();
    `
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoomLevel});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var customMarker = null;
        ${markersJs}
        ${userMarkerJs}
        ${customPinJs}

        // Evento al tocar cualquier punto del mapa para poner un pin
        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;

          if (customMarker) {
            map.removeLayer(customMarker);
          }

          var greenIcon = L.divIcon({
            html: '<div style="background:#16A36A;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.6);"></div>',
            className: ''
          });

          customMarker = L.marker([lat, lng], { icon: greenIcon })
            .addTo(map)
            .bindPopup("<b>📌 Pin marcado</b><br>Lat: " + lat.toFixed(4) + "<br>Lng: " + lng.toFixed(4))
            .openPopup();

          var payload = JSON.stringify({ type: 'MAP_CLICK', lat: lat, lng: lng });
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(payload);
          } else {
            window.parent.postMessage(payload, '*');
          }
        });
      </script>
    </body>
    </html>
  `;

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { height }]}>
        <iframe
          srcDoc={htmlContent}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: 12
          }}
        />
      </View>
    );
  }

  const { WebView } = require("react-native-webview");

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={(event) => {
          if (!onMapPress) return;
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "MAP_CLICK") {
              onMapPress({ latitude: data.lat, longitude: data.lng });
            }
          } catch (e) {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E8ECF3"
  },
  webview: {
    flex: 1
  }
});