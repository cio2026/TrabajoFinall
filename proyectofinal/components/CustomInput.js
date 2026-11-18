
import React from "react";
import { TextInput, StyleSheet } from "react-native";

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default"
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
      placeholderTextColor="#999"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#F1F3F8",
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    fontSize: 15
  }
});
