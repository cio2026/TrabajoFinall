import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const showMessage = (type, title, text, onOk) => {
    setFeedback({ type, text });
    if (Platform.OS !== "web") {
      Alert.alert(title, text, onOk ? [{ text: "Aceptar", onPress: onOk }] : undefined);
    } else if (onOk) {
      setTimeout(onOk, 1500);
    }
  };

  const handleRegister = async () => {
    setFeedback({ type: "", text: "" });

    if (!name.trim() || !email.trim() || !password.trim()) {
      showMessage("error", "Atención", "Completá todos los campos.");
      return;
    }

    if (!email.includes("@")) {
      showMessage("error", "Atención", "Ingresá un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      showMessage(
        "error",
        "Atención",
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim().toLowerCase(), password);

      showMessage(
        "success",
        "¡Registro exitoso!",
        "Cuenta creada correctamente. Redirigiendo...",
        () => navigation.navigate("Login")
      );
    } catch (error) {
      showMessage(
        "error",
        "Error de registro",
        error.message || "No se pudo completar el registro."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HotelGo</Text>
      <Text style={styles.title}>Crear cuenta</Text>

      {feedback.text !== "" && (
        <View
          style={[
            styles.messageBox,
            feedback.type === "error" ? styles.errorBox : styles.successBox
          ]}
        >
          <Text
            style={[
              styles.messageText,
              feedback.type === "error" ? styles.errorText : styles.successText
            ]}
          >
            {feedback.text}
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña (mínimo 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>REGISTRARME</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("Login")}
        style={styles.link}
      >
        <Text style={styles.linkText}>¿Ya tenés cuenta? Iniciá sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#F5F7FC"
  },
  logo: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#2457C5",
    textAlign: "center",
    marginBottom: 10
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },
  messageBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 15
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#EF4444"
  },
  successBox: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#22C55E"
  },
  messageText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 13
  },
  errorText: {
    color: "#B91C1C"
  },
  successText: {
    color: "#15803D"
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16
  },
  button: {
    backgroundColor: "#2457C5",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    minHeight: 55,
    justifyContent: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16
  },
  link: {
    marginTop: 25,
    alignItems: "center"
  },
  linkText: {
    color: "#2457C5",
    fontWeight: "bold"
  }
});


