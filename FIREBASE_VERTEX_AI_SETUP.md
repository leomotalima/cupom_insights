# Google AI (Gemini) Setup Guide - FREE VERSION ✅

## ✅ What Was Changed

Your app now uses **Google AI Backend** with a **FREE API key** from Google AI Studio.

### Benefits:
- ✅ **100% Free** - No billing required!
- ✅ **Quick setup** - Just add API key
- ✅ **No Firebase Console setup** needed
- ✅ **Same Gemini models** (2.0 Flash, Pro, etc.)
- ⚠️ **Has rate limits** (generous for testing/development)

## 🔧 Code Changes Made

1. **Removed `@google/generative-ai` package** - No longer needed
2. **Updated `src/services/firebaseService.ts`** - Now uses `firebase/ai` with `GoogleAIBackend`
3. **Added `GEMINI_API_KEY` to `.env`** - Your free API key
4. **Updated UI labels** - Now shows "Google AI (Gemini)"

## 📦 How It Works

```typescript
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { GEMINI_API_KEY } from "@env";

// Initialize with Google AI backend (free)
const ai = getAI(app, {
  backend: new GoogleAIBackend(GEMINI_API_KEY)
});

// Get model (Gemini 2.0 Flash - latest version)
const model = getGenerativeModel(ai, {
  model: "gemini-2.0-flash-exp"
});
```

**Note:** Gemini 1.5 models were retired on September 24, 2025. We now use `gemini-2.0-flash-exp`.

### Available Models (as of 2025):
- `gemini-2.0-flash-exp` - ⚡ Latest experimental, fastest
- `gemini-2.0-pro-exp` - 🎯 More capable, slower
- `gemini-1.0-pro` - ✅ Stable, older generation

## 🚀 Setup Complete!

Your app is already configured and ready to use! Just restart your development server:

```bash
npm start
```

## 🔄 Alternative: Switch to Firebase Vertex AI (Requires Billing)

### Step 1: Enable Vertex AI API in Google Cloud Console

**Important:** Vertex AI requires a billing account on Google Cloud Platform.

1. Go to Google Cloud Console: https://console.cloud.google.com/

2. Select your project: **projeto-com-ia-generativa** (671172311867)

3. Set up billing (if not already done):
   - Click **Billing** in the left menu
   - Link a billing account
   - Note: Vertex AI has a free tier, but billing must be enabled

4. Navigate to **APIs & Services** → **Library**

5. Search for "**Vertex AI API**" and click **Enable**

6. Wait a few minutes for the API to be fully activated

7. (Recommended) Also enable "**Vertex AI Gemini API**" for better reliability

### Step 2: Test Your App

1. Restart your development server:
   ```bash
   npm start
   # or
   npx expo start
   ```

2. Test the receipt scanning feature:
   - Take a photo of a receipt
   - The app should now use Firebase Vertex AI to process it
   - Check the console for: "🔄 Iniciando processamento do cupom com Firebase Vertex AI..."

3. Test the chat feature:
   - Navigate to the Chat tab
   - Ask a financial question
   - The assistant should respond using Firebase Vertex AI

## ⚠️ Troubleshooting

### Error: "Vertex AI is not enabled"
- Make sure you enabled the Vertex AI API in Google Cloud Console
- Wait a few minutes for the API to be fully activated
- Ensure billing is enabled on your Google Cloud project

### Error: "Permission denied" or "Billing not enabled"
- **Vertex AI requires billing** to be enabled
- Go to Google Cloud Console → Billing
- Link a billing account to your project
- Note: There is a free tier available

### Alternative: Use Google AI Backend (Free, but less reliable)

If you don't want to enable billing for Vertex AI, you can use the Google AI backend:

**Option A: Get a free Gemini API key**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Add key to `.env`: `GEMINI_API_KEY=your_key_here`

**Option B: Modify firebaseService.ts to use GoogleAIBackend**
```typescript
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { GEMINI_API_KEY } from "@env";

const ai = getAI(app, {
  backend: new GoogleAIBackend(GEMINI_API_KEY)
});
```

**Note:** Google AI backend has rate limits and is less reliable than Vertex AI.

### Error: "Model not found" or "RETIRED_MODEL"
- **Gemini 1.5 models were retired on September 24, 2025**
- We now use `gemini-2.0-flash-exp` (already updated in the code)
- Alternative models you can try:
  - `gemini-2.0-pro-exp` - More capable but slower
  - `gemini-1.0-pro` - Older but stable
- To change model, edit `src/services/firebaseService.ts` line 19
- Try changing location if needed: `new VertexAIBackend("us-east1")`

### Still getting errors?
1. Check console logs for detailed error messages
2. Verify Firebase API key is valid in `.env`
3. Ensure Firebase project exists and is accessible
4. Try deleting `node_modules` and running `npm install` again

## 📝 Files Modified

- `src/services/firebaseService.ts` - Now uses Firebase Vertex AI
- `src/firebase.ts` - Simplified Firestore config
- `src/screens/ReceiptScreen.tsx` - Enhanced error handling
- `src/screens/GeminiChatScreen.tsx` - Updated UI labels
- `.env` - Removed GEMINI_API_KEY (not needed)
- `package.json` - Removed @google/generative-ai

## 🎯 Next Steps

1. Enable Vertex AI API (see Step 1 above)
2. Test the app
3. If it works, commit the changes!

## 💡 Additional Resources

- [Firebase Vertex AI Documentation](https://firebase.google.com/docs/vertex-ai)
- [Gemini API Models](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
