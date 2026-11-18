import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Image
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { hotels } from "../data/hotels";
import { useAuth } from "../context/AuthContext";
import CustomButton from "../components/CustomButton";

const CUSTOM_PINS_KEY = "@hotelgo_custom_pins_persist";

export default function MapScreen({ navigation }) {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [userLocation, setUserLocation] = useState(null);
  const [customPins, setCustomPins] = useState([]);
  const [loadingGps, setLoadingGps] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [pinTitle, setPinTitle] = useState("");
  const [pinImage, setPinImage] = useState(null);

  const loadSavedPins = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(CUSTOM_PINS_KEY);
      const allPins = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(allPins) || !user) {
        setCustomPins([]);
        return;
      }

      const targetId = user.id ? String(user.id) : "";
      const targetEmail = user.email
        ? String(user.email).toLowerCase().trim()
        : "";

      const userPins = allPins.filter(
        (p) =>
          (targetId !== "" && String(p.userId) === targetId) ||
          (targetEmail !== "" && String(p.userEmail) === targetEmail)
      );

      setCustomPins(userPins);
    } catch (e) {
      console.log("Error cargando pines:", e);
    }
  }, [user]);

  useEffect(() => {
    if (isFocused) {
      loadSavedPins();
    }
  }, [isFocused, loadSavedPins]);

  const getDeviceLocation = async () => {
    try {
      setLoadingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Activá el GPS del dispositivo para ver tu ubicación."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    } catch (error) {
      Alert.alert("GPS", "No se pudo obtener la ubicación del dispositivo.");
    } finally {
      setLoadingGps(false);
    }
  };

  useEffect(() => {
    getDeviceLocation();
  }, []);

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para elegir una foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,
      base64: true
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const persistentUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setPinImage(persistentUri);
    }
  };

  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos permiso para usar la cámara."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,
      base64: true
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const persistentUri = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setPinImage(persistentUri);
    }
  };

  const handleSavePin = async () => {
    if (!pinTitle.trim()) {
      Alert.alert("Falta el nombre", "Escribí un nombre para este pin.");
      return;
    }

    try {
      const newPin = {
        id: Date.now().toString(),
        userId: user?.id ? String(user.id) : "guest",
        userEmail: user?.email
          ? String(user.email).toLowerCase().trim()
          : "guest",
        latitude: pendingCoords.latitude,
        longitude: pendingCoords.longitude,
        title: pinTitle.trim(),
        image: pinImage
      };

      const stored = await AsyncStorage.getItem(CUSTOM_PINS_KEY);
      const allPins = stored ? JSON.parse(stored) : [];
      const updatedAll = [newPin, ...allPins];

      await AsyncStorage.setItem(CUSTOM_PINS_KEY, JSON.stringify(updatedAll));
      setCustomPins([newPin, ...customPins]);

      setModalVisible(false);
      setPendingCoords(null);
      setPinTitle("");
      setPinImage(null);
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el pin en el dispositivo.");
    }
  };

  const handleDeletePin = (pinId) => {
    Alert.alert("Eliminar pin", "¿Querés borrar este pin guardado?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const stored = await AsyncStorage.getItem(CUSTOM_PINS_KEY);
          const allPins = stored ? JSON.parse(stored) : [];
          const filteredAll = allPins.filter(
            (p) => String(p.id) !== String(pinId)
          );
          await AsyncStorage.setItem(
            CUSTOM_PINS_KEY,
            JSON.stringify(filteredAll)
          );
          setCustomPins(
            customPins.filter((p) => String(p.id) !== String(pinId))
          );
        }
      }
    ]);
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "MAP_CLICK") {
        setPendingCoords({ latitude: data.lat, longitude: data.lng });
        setPinTitle("");
        setPinImage(null);
        setModalVisible(true);
      } else if (data.type === "SELECT_HOTEL") {
        const selected = hotels.find((h) => String(h.id) === String(data.id));
        if (selected) {
          navigation.navigate("HotelDetail", {
            hotelId: selected.id,
            hotel: selected
          });
        }
      }
    } catch (e) {
      console.log("Error mensaje mapa:", e);
    }
  };

  const centerLat = userLocation?.latitude || hotels[0]?.latitude || -34.5875;
  const centerLng =
    userLocation?.longitude || hotels[0]?.longitude || -58.3886;
  const zoomLevel = userLocation ? 12 : 4;

  const fullMapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .popup-box { text-align: center; font-family: sans-serif; }
        .popup-btn {
          background: #2457C5; color: white; border: none;
          padding: 5px 10px; border-radius: 6px; margin-top: 5px; font-weight: bold;
        }
        .pin-img { width: 130px; height: 85px; object-fit: cover; border-radius: 6px; margin-top: 4px; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoomLevel});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        var hotels = ${JSON.stringify(hotels)};
        hotels.forEach(function(h) {
          if (typeof h.latitude === 'number' && typeof h.longitude === 'number') {
            var html = '<div class="popup-box"><b>' + h.name + '</b><br>' + h.city +
              '<br><button class="popup-btn" onclick="selectHotel(\\'' + h.id + '\\')">Ver hotel</button></div>';
            L.marker([h.latitude, h.longitude]).addTo(map).bindPopup(html);
          }
        });

        var greenIcon = new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
        });

        var customPins = ${JSON.stringify(customPins)};
        customPins.forEach(function(p) {
          var imgTag = p.image ? '<br><img class="pin-img" src="' + p.image + '" />' : '';
          var html = '<div class="popup-box"><b>📌 ' + p.title + '</b>' + imgTag + '</div>';
          L.marker([p.latitude, p.longitude], { icon: greenIcon }).addTo(map).bindPopup(html);
        });

        ${
          userLocation
            ? `L.circleMarker([${userLocation.latitude}, ${userLocation.longitude}], {
                radius: 8, color: '#2457C5', fillColor: '#3B82F6', fillOpacity: 0.9
              }).addTo(map).bindPopup("📍 Tu ubicación actual");`
            : ""
        }

        map.on('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_CLICK',
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }));
        });

        function selectHotel(id) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SELECT_HOTEL',
            id: id
          }));
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Mapa de Hoteles</Text>
      </View>

      <Text style={styles.hint}>
        👆 Tocá cualquier punto del mapa para agregar un pin con nombre y foto
      </Text>

      <View style={styles.mapContainer}>
        <WebView
          style={styles.map}
          originWhitelist={["*"]}
          source={{ html: fullMapHtml }}
          onMessage={handleWebViewMessage}
        />
      </View>

      <View style={styles.controls}>
        {loadingGps ? (
          <ActivityIndicator color="#2457C5" style={{ marginVertical: 10 }} />
        ) : (
          <CustomButton
            title="📡 Actualizar mi GPS"
            onPress={getDeviceLocation}
          />
        )}
      </View>

      <ScrollView style={styles.list}>
        {customPins.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Mis pines guardados ({customPins.length})
            </Text>
            {customPins.map((pin) => (
              <View key={pin.id} style={styles.customPinCard}>
                {pin.image ? (
                  <Image
                    source={{ uri: pin.image }}
                    style={styles.pinThumbnail}
                  />
                ) : (
                  <View style={styles.pinPlaceholder}>
                    <Text style={{ fontSize: 20 }}>📌</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.customPinTitle}>{pin.title}</Text>
                  <Text style={styles.location}>
                    📍 {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                  </Text>
                </View>
                <Pressable onPress={() => handleDeletePin(pin.id)}>
                  <Text style={styles.deleteText}>Borrar</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Hoteles disponibles</Text>
        {hotels.map((hotel) => (
          <Pressable
            key={hotel.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("HotelDetail", {
                hotelId: hotel.id,
                hotel: hotel
              })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <Text style={styles.location}>
                📍 {hotel.city}, {hotel.country}
              </Text>
            </View>
            <Text style={styles.arrow}>Ver →</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📌 Nuevo pin en el mapa</Text>
            {pendingCoords && (
              <Text style={styles.modalCoords}>
                Coordenadas: {pendingCoords.latitude.toFixed(4)},{" "}
                {pendingCoords.longitude.toFixed(4)}
              </Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Nombre del lugar (ej: Mirador, Playa...)"
              value={pinTitle}
              onChangeText={setPinTitle}
            />

            <View style={styles.photoButtons}>
              <Pressable
                style={styles.photoBtn}
                onPress={pickImageFromGallery}
              >
                <Text style={styles.photoBtnText}>🖼️ Galería</Text>
              </Pressable>

              <Pressable
                style={styles.photoBtn}
                onPress={takePhotoWithCamera}
              >
                <Text style={styles.photoBtnText}>📷 Cámara</Text>
              </Pressable>
            </View>

            {pinImage && (
              <Image source={{ uri: pinImage }} style={styles.previewImage} />
            )}

            <CustomButton
              title="Guardar pin"
              color="#16A36A"
              onPress={handleSavePin}
            />
            <CustomButton
              title="Cancelar"
              color="#888"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
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
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3
  },
  backButton: {
    marginRight: 15
  },
  backText: {
    color: "#2457C5",
    fontWeight: "bold",
    fontSize: 16
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#202938"
  },
  hint: {
    textAlign: "center",
    color: "#2457C5",
    fontWeight: "bold",
    fontSize: 12,
    paddingVertical: 8
  },
  mapContainer: {
    width: "100%",
    height: 280
  },
  map: {
    width: "100%",
    height: 280
  },
  controls: {
    paddingHorizontal: 15,
    paddingTop: 4
  },
  list: {
    paddingHorizontal: 15
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#202938",
    marginTop: 10,
    marginBottom: 8
  },
  customPinCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#16A36A"
  },
  pinThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12
  },
  pinPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center"
  },
  customPinTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#15803D"
  },
  deleteText: {
    color: "#DC4444",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 8
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2
  },
  hotelName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#2457C5"
  },
  location: {
    color: "#666",
    fontSize: 12,
    marginTop: 2
  },
  arrow: {
    color: "#2457C5",
    fontWeight: "bold"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#202938",
    marginBottom: 4
  },
  modalCoords: {
    fontSize: 12,
    color: "#666",
    marginBottom: 14
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F8FAFC",
    marginBottom: 12
  },
  photoButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  photoBtn: {
    flex: 1,
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#2457C5",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center"
  },
  photoBtnText: {
    color: "#2457C5",
    fontWeight: "bold"
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 12
  }
});