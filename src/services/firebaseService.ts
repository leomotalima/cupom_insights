import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
};

// https://firebase.google.com/docs/ai-logic/model-parameters?api=dev
const generationConfig = {
  maxOutputTokens: 512,  // controla o comprimento da resposta
  temperature: 0.5,   // controla a aleatoriedade
  topP: 0.8,   // controla a diversidade
};

const app = initializeApp(firebaseConfig);
// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });


export interface ChatHistory {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

class FirebaseService {
  async chatWithHistory(message: string, history: ChatHistory[]): Promise<string> {
    // Adaptação para AI Logic
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    return result.response.text();
  }
}

export default new FirebaseService();
