import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ReceiptScreen from "../screens/ReceiptScreen";
import GeminiChatScreen from "../screens/GeminiChatScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "Receipts") iconName = "receipt-outline";
            else iconName = "chatbubbles-outline";

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Receipts" component={ReceiptScreen} />
        <Tab.Screen name="Chat" component={GeminiChatScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
