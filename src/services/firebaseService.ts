import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { GEMINI_API_KEY } from "@env";
import { app, db } from "../firebase";

// Initialize Firebase AI with Google AI backend (free, no billing required)
// Uses Google AI Studio API key from .env
const ai = getAI(app, {
  backend: new GoogleAIBackend(GEMINI_API_KEY)
});

const generationConfig = {
  maxOutputTokens: 512,
  temperature: 0.5,
  topP: 0.8,
};

// Get the generative model (Gemini 2.0 Flash - latest version)
// Note: Gemini 1.5 models were retired on September 24, 2025
const model = getGenerativeModel(ai, {
  model: "gemini-2.0-flash-exp"
}, {
  generationConfig
});

export interface ChatHistory {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

class FirebaseService {
  async chatWithHistory(message: string, history: ChatHistory[]): Promise<string> {
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    return result.response.text();
  }

  getModel() {
    return model;
  }
}

export default new FirebaseService();
export { db };
  
