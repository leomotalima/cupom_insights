import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Button, Image, ScrollView, Text, View, StyleSheet } from "react-native";
import firebaseService, { db } from "../services/firebaseService";
import { sanitizeForFirestore, validateReceiptData } from "../utils/dataValidation";

export default function ReceiptScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  async function capturarCupom() {
    setErrorDetails(null);

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
        console.log("🔄 Iniciando processamento do cupom com Google AI (Gemini)...");

        const model = firebaseService.getModel();

        const prompt = `Extraia as seguintes informações do cupom fiscal e retorne APENAS um objeto JSON válido (sem markdown, sem explicações):
{
  "valor_total": "valor em formato numérico ou string",
  "data_hora": "data e hora da compra",
  "estabelecimento": "nome do estabelecimento",
  "categoria": "uma das categorias: alimentação, transporte, lazer, saúde, outros"
}`;

        const result = await model.generateContent([
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: foto.assets[0].base64 } },
        ]);

        const texto = result.response.text();
        console.log("📄 Resposta da IA:", texto);

        let json = {};
        try {
          // Remove markdown code blocks if present
          const cleanText = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          json = JSON.parse(cleanText);
          console.log("✅ JSON parseado com sucesso:", json);
        } catch (parseError) {
          console.warn("⚠️ A resposta não está em formato JSON válido:", texto);
          json = { resposta: texto };
        }

        // Validate and sanitize data
        const validatedData = validateReceiptData(json);
        const sanitizedData = sanitizeForFirestore(validatedData);

        console.log("🧹 Dados sanitizados:", sanitizedData);

        setDados(sanitizedData);

        // Try to save to Firestore, but don't fail if it doesn't work
        console.log("💾 Tentando salvar no Firestore...");
        try {
          const docRef = await addDoc(collection(db, "compras"), {
            ...sanitizedData,
            criadoEm: serverTimestamp(),
          });

          console.log("✅ Documento salvo com ID:", docRef.id);
          Alert.alert("Cupom salvo!", "As informações foram processadas e salvas com sucesso no Firestore.");
        } catch (firestoreError: any) {
          console.warn("⚠️ Erro ao salvar no Firestore (dados ainda foram processados):", firestoreError);

          // Still show success because AI processing worked
          Alert.alert(
            "Cupom processado!",
            "A IA extraiu as informações com sucesso.\n\nNota: Não foi possível salvar no Firestore (erro de conexão), mas os dados estão visíveis na tela."
          );
        }

      } catch (erro: any) {
        console.error("❌ Erro completo:", erro);

        let errorMessage = "Não foi possível processar o cupom.";
        let details = "";

        if (erro?.message) {
          details = erro.message;
        }

        if (erro?.code) {
          errorMessage += `\n\nCódigo: ${erro.code}`;
          details += `\nCode: ${erro.code}`;
        }

        if (erro?.status) {
          errorMessage += `\nStatus: ${erro.status}`;
          details += `\nStatus: ${erro.status}`;
        }

        // Check for specific error types
        if (details.includes("400") || details.includes("Bad Request")) {
          errorMessage = "Erro de requisição inválida. Verifique sua chave de API.";
        } else if (details.includes("403") || details.includes("Forbidden")) {
          errorMessage = "Acesso negado. Verifique as permissões da API.";
        } else if (details.includes("PERMISSION_DENIED")) {
          errorMessage = "Permissão negada no Firestore. Verifique as regras de segurança.";
        }

        setErrorDetails(details);
        Alert.alert("Erro ao processar cupom", errorMessage);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="📸 Tirar Foto do Cupom" onPress={capturarCupom} />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processando cupom...</Text>
        </View>
      )}

      {image && <Image source={{ uri: image }} style={styles.image} />}

      {dados && Object.keys(dados).length > 0 && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>✅ Informações Extraídas:</Text>
          {dados.estabelecimento && (
            <Text style={styles.resultText}>🏪 Estabelecimento: {dados.estabelecimento}</Text>
          )}
          {dados.valor_total && (
            <Text style={styles.resultText}>💰 Valor: {dados.valor_total}</Text>
          )}
          {dados.data_hora && (
            <Text style={styles.resultText}>📅 Data/Hora: {dados.data_hora}</Text>
          )}
          {dados.categoria && (
            <Text style={styles.resultText}>📂 Categoria: {dados.categoria}</Text>
          )}
          {dados.resposta && (
            <Text style={styles.resultText}>📝 Resposta: {dados.resposta}</Text>
          )}
        </View>
      )}

      {errorDetails && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Detalhes do Erro:</Text>
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
    width: 250,
    height: 250,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  resultContainer: {
    marginTop: 20,
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
