import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Suas telas
import ReceiptScreen from '../screens/ReceiptScreen';
import GeminiChatScreen from '../screens/GeminiChatScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer
      linking={{
        prefixes: ['http://localhost:8081', 'http://localhost:19006'],
        config: {
          screens: {
            Receipts: '',
            Chat: 'chat',
          },
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName:
              | keyof typeof Ionicons.glyphMap
              | undefined = undefined;

            if (route.name === 'Receipts') iconName = 'receipt-outline';
            else if (route.name === 'Chat') iconName = 'chatbubbles-outline';

            return (
              <Ionicons name={iconName ?? 'ellipse-outline'} size={size} color={color} />
            );
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Receipts" component={ReceiptScreen} />
        <Tab.Screen name="Chat" component={GeminiChatScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
