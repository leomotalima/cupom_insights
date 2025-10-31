import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: 'AIzaSyCvFsFJUb_CPpqzfD0_ZRKa8lZ-gn9WbBM',
  authDomain: 'projeto-com-ia-generativa.firebaseapp.com',
  projectId: 'projeto-com-ia-generativa',
  storageBucket: 'projeto-com-ia-generativa.firebasestorage.app',
  messagingSenderId: '671172311867',
  appId: '1:671172311867:web:00cbe69a6e8f620722951e',
  measurementId: 'G-D05HV1M9KE',
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
