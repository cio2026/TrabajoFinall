
import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet
} from "react-native";

export default function CustomButton({
  title,
  onPress,
  loading = false,
  color = "#2457C5"
}) {
  return (
    <Pressable
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 7
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
