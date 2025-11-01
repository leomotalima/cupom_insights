import { initializeApp } from "firebase/app";
import { initializeFirestore, memoryLocalCache, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import {
  EXPO_PUBLIC_API_KEY,
  EXPO_PUBLIC_AUTH_DOMAIN,
  EXPO_PUBLIC_PROJECT_ID,
  EXPO_PUBLIC_STORAGE_BUCKET,
  EXPO_PUBLIC_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_APP_ID,
  EXPO_PUBLIC_MEASUREMENT_ID,
} from "@env";

const firebaseConfig = {
  apiKey: EXPO_PUBLIC_API_KEY,
  authDomain: EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_APP_ID,
  measurementId: EXPO_PUBLIC_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

// AGGRESSIVE configuration to avoid WebChannel 400 errors on web
// This completely disables real-time sync and uses REST API only
export const db = Platform.OS === 'web'
  ? initializeFirestore(app, {
      localCache: memoryLocalCache(),
      ignoreUndefinedProperties: true,
      // Force long polling instead of WebChannel (more compatible)
      experimentalForceLongPolling: true,
      // Disable auto-detection to prevent WebChannel attempts
      experimentalAutoDetectLongPolling: false,
    })
  : initializeFirestore(app, {
      ignoreUndefinedProperties: true,
    });

export const storage = getStorage(app);
export { firebaseConfig };