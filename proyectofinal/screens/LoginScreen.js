
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";

import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { useAuth } from "../context/AuthContext";
import { validateLogin } from "../utils/validations";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const error = validateLogin({ email, password });

    if (error) {
      Alert.alert("Atención", error);
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>HotelGo</Text>
        <Text style={styles.subtitle}>
          Encontrá tu próximo destino
        </Text>

        <Text style={styles.title}>Bienvenido</Text>

        <CustomInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <CustomInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <CustomButton
          title="Iniciar sesión"
          onPress={handleLogin}
          loading={loading}
        />

        <Text
          style={styles.link}
          onPress={() => navigation.navigate("Register")}
        >
          ¿No tenés cuenta? Registrate
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F5F7FC",
    padding: 24
  },
  content: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 20
  },
  logo: {
    fontSize: 36,
    color: "#2457C5",
    fontWeight: "bold",
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    marginBottom: 35
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15
  },
  link: {
    color: "#2457C5",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold"
  }
});
