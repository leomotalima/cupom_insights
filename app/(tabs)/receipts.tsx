import React from 'react';
import { View, StatusBar } from 'react-native';
import ReceiptScreen from '../../src/screens/ReceiptScreen';

export default function ReceiptsTab() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" />
      <ReceiptScreen />
    </View>
  );
}
