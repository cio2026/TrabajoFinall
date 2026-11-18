
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2457C5",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 8
        }
      }}
    >
      <Tab.Screen
        name="Explore"
        component={HomeScreen}
        options={{
          title: "Explorar",
          tabBarIcon: () => "🏨"
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Mi perfil",
          tabBarIcon: () => "👤"
        }}
      />
    </Tab.Navigator>
  );
}
