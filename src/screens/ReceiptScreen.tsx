import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, Image, ScrollView, Text, View, StyleSheet,} from "react-native";
import { useRouter } from "expo-router";
import { db, model } from "../services/firebaseService";

import {sanitizeForFirestore,validateReceiptData,} from "../utils/dataValidation";

export default function ReceiptScreen() {
  const [image, setImage] = useState<{ uri: string; base64: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const router = useRouter();

  async function capturarCupom() {
    setErrorDetails(null);
    setDados(null);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Habilite o acesso à câmera para continuar."
      );
      return;
    }

    const foto = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.8,
    });

    if (!foto.canceled && foto.assets?.[0].base64) {
      setImage({
        uri: foto.assets[0].uri,
        base64: foto.assets[0].base64,
      });
      Alert.alert(
        "Imagem capturada",
        "Agora clique em 'Analisar Cupom com IA' para processar os dados."
      );
    }
  }

  async function analisarCupom() {
    if (!image?.base64) {
      Alert.alert("Erro", "Capture uma imagem antes de analisar.");
      return;
    }

    setLoading(true);
    setErrorDetails(null);

    try {
        const prompt = `Extraia as seguintes informações do cupom fiscal e retorne APENAS um objeto JSON válido (sem markdown, sem explicações):
{
  "valor_total": "valor numérico ou string",
  "data_hora": "data e hora da compra",
  "estabelecimento": "nome do estabelecimento",
  "categoria": "alimentação, transporte, lazer, saúde ou outros"
}`;

      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: image.base64 } },
      ]);

      const texto = result.response.text();
      let json = {};
      try {
        const cleanText = texto
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        json = JSON.parse(cleanText);
      } catch {
        json = { resposta: texto };
      }

      const validatedData = validateReceiptData(json);
      const sanitizedData = sanitizeForFirestore(validatedData);

      setDados(sanitizedData);

      try {
        await addDoc(collection(db, "compras"), {
          ...sanitizedData,
          criadoEm: serverTimestamp(),
        });
        Alert.alert(
          "Cupom processado",
          "As informações foram extraídas e salvas no Firestore."
        );
      } catch (firestoreError: any) {
        console.warn("Erro ao salvar no Firestore:", firestoreError);
        Alert.alert(
          "Cupom processado",
          "A IA analisou o cupom, mas o Firestore não pôde ser atualizado."
        );
      }
    } catch (erro: any) {
      console.error("Erro ao processar cupom:", erro);
      let msg = "Não foi possível processar o cupom.";
      if (erro.message?.includes("403"))
        msg = "Acesso negado à API. Verifique sua chave Firebase.";
      setErrorDetails(erro.message || "Erro desconhecido");
      Alert.alert("Erro ao processar cupom", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cupom Insights</Text>
      <Text style={styles.subtitle}>
        Análise Inteligente de Cupons com Firebase AI Logic
      </Text>

      <Button title="Tirar Foto do Cupom" onPress={capturarCupom} />

      {image && !loading && (
        <Button title="Analisar Cupom com IA" onPress={analisarCupom} color="#007AFF" />
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processando cupom...</Text>
        </View>
      )}

      {image && <Image source={{ uri: image.uri }} style={styles.image} />}

      {dados && Object.keys(dados).length > 0 && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Informações Extraídas:</Text>
          {dados.estabelecimento && (
            <Text style={styles.resultText}>
              Estabelecimento: {dados.estabelecimento}
            </Text>
          )}
          {dados.valor_total && (
            <Text style={styles.resultText}>Valor: {dados.valor_total}</Text>
          )}
          {dados.data_hora && (
            <Text style={styles.resultText}>Data/Hora: {dados.data_hora}</Text>
          )}
          {dados.categoria && (
            <Text style={styles.resultText}>Categoria: {dados.categoria}</Text>
          )}
          <Button
            title="Ver Insights"
            onPress={() => router.push("/tabs/chat")}
            color="#34A853"
          />
        </View>
      )}

      {errorDetails && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Detalhes do Erro:</Text>
          <Text style={styles.errorText}>{errorDetails}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: "100%",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  image: {
    width: 260,
    height: 260,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  resultContainer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
    color: "#007AFF",
  },
  resultText: {
    fontSize: 14,
    marginVertical: 5,
    color: "#333",
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff5f5",
    borderRadius: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  errorTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    color: "#ff4444",
  },
  errorText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
});
