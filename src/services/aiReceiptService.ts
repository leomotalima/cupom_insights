import { getGenerativeModel, getVertexAI } from "firebase/vertexai";
import { app } from "../firebase";

export async function analyzeReceipt(base64Image: string) {
  try {
    const vertexAI = getVertexAI(app);
    const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });

    const prompt = `
      Analise a imagem do cupom fiscal e extraia:
      - Valor total da compra
      - Data e hora da transação
      - Nome do estabelecimento
      - Categoria da despesa (alimentação, transporte, lazer, etc.)
      Retorne APENAS um JSON válido:
      {
        "valor_total": number,
        "data_hora": string,
        "estabelecimento": string,
        "categoria": string
      }
    `;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
    ]);

    const text = result.response.text();
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Erro ao processar o cupom com IA:", error);
    throw error;
  }
}