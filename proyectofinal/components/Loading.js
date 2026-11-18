
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet
} from "react-native";

export default function Loading({ message = "Cargando..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2457C5" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FC"
  },
  text: {
    marginTop: 15,
    color: "#2457C5"
  }
});
