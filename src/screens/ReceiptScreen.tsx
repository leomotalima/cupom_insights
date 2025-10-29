import React, { useState } from "react";
import { View, Text, Button, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db } from "../services/firebaseService";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import firebaseService from "../services/firebaseService";

export default function ReceiptScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<any>(null);

  async function capturarCupom() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Habilite o acesso à câmera para continuar.");
      return;
    }

    const foto = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.8,
    });

    if (!foto.canceled && foto.assets?.[0].base64) {
      setImage(foto.assets[0].uri);
      setLoading(true);

      try {
        const model = firebaseService["model"];
        const result = await model.generateContent([
          {
            role: "user",
            parts: [
              { text: "Extraia do cupom fiscal: valor_total, data_hora, estabelecimento e categoria (alimentação, transporte, lazer, saúde, outros)." },
              { inlineData: { mimeType: "image/jpeg", data: foto.assets[0].base64 } },
            ],
          },
        ]);

        const texto = result.response.text();
        const json = JSON.parse(texto);
        setDados(json);

        await addDoc(collection(db, "compras"), {
          ...json,
          criadoEm: serverTimestamp(),
        });

        Alert.alert("Cupom salvo!", "As informações foram enviadas para o Firestore.");
      } catch (erro) {
        console.error(erro);
        Alert.alert("Erro", "Não foi possível processar o cupom.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={{ alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Button title="📸 Tirar Foto do Cupom" onPress={capturarCupom} />
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {image && <Image source={{ uri: image }} style={{ width: 250, height: 250, marginTop: 20, borderRadius: 10 }} />}
      {dados && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: "bold" }}>Resultado da IA:</Text>
          <Text>{JSON.stringify(dados, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}
