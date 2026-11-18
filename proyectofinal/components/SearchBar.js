
import React from "react";
import { TextInput, StyleSheet, View, Text } from "react-native";

export default function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔎</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar ciudad, país u hotel..."
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 15
  },
  icon: {
    fontSize: 18
  },
  input: {
    flex: 1,
    padding: 15
  }
});
