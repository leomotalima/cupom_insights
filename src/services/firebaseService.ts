import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { app, db } from "../firebase";  

const generationConfig = {
  maxOutputTokens: 512,   
  temperature: 0.5,       
  topP: 0.8,              
};


const ai = getAI(app, { backend: new GoogleAIBackend() });


const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });


export interface ChatHistory {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}


class FirebaseService {
  async chatWithHistory(message: string, history: ChatHistory[]): Promise<string> {
    const chat = model.startChat({ history, generationConfig });
    const result = await chat.sendMessage(message);
    return result.response.text();
  }
}

export default new FirebaseService();
export { db };  
