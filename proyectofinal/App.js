import "react-native-gesture-handler";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import HotelDetailScreen from "./screens/HotelDetailScreen";
import ReservationsScreen from "./screens/ReservationsScreen";
import MyReviewsScreen from "./screens/MyReviewsScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import MapScreen from "./screens/MapScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: "#2457C5" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold" },
        drawerActiveTintColor: "#2457C5",
        drawerInactiveTintColor: "#444",
        drawerLabelStyle: { fontSize: 15, fontWeight: "bold" }
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "🏨 Inicio" }}
      />
      <Drawer.Screen
        name="Reservations"
        component={ReservationsScreen}
        options={{ title: "📅 Mis reservas" }}
      />
      <Drawer.Screen
        name="MyReviews"
        component={MyReviewsScreen}
        options={{ title: "⭐ Mis reseñas" }}
      />
      <Drawer.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: "❤️ Favoritos" }}
      />
      <Drawer.Screen
        name="Map"
        component={MapScreen}
        options={{ title: "🗺️ Mapa y pines" }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "👤 Mi perfil" }}
      />
    </Drawer.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2457C5" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="MainDrawer"
            component={MainDrawer}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HotelDetail"
            component={HotelDetailScreen}
            options={{
              title: "Detalle del hotel",
              headerStyle: { backgroundColor: "#2457C5" },
              headerTintColor: "#FFFFFF"
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </FavoritesProvider>
    </AuthProvider>
  );
}