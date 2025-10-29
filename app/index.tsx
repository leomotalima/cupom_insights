import React from 'react';
import { View, StatusBar } from 'react-native';
import GeminiChatScreen from '../src/screens/GeminiChatScreen';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" />
      <GeminiChatScreen />
    </View>
  );
}