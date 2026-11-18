
import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet
} from "react-native";

export default function HotelModal({ visible, hotel, onClose }) {
  if (!hotel) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Image source={{ uri: hotel.image }} style={styles.image} />

          <Text style={styles.title}>{hotel.name}</Text>
          <Text>{hotel.city}, {hotel.country}</Text>

          <Text style={styles.description}>
            {hotel.description}
          </Text>

          <Text style={styles.services}>
            Servicios: {hotel.services.join(", ")}
          </Text>

          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 20
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12
  },
  title: {
    fontSize: 21,
    fontWeight: "bold",
    marginTop: 15
  },
  description: {
    marginTop: 12,
    lineHeight: 22
  },
  services: {
    marginTop: 12
  },
  button: {
    backgroundColor: "#2457C5",
    padding: 13,
    borderRadius: 10,
    marginTop: 18
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  }
});
