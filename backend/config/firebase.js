import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore }  from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWEgpXJEtYNmEG_Qvv9KzWZsmCFwtDkxs",
  authDomain: "inmobiliaria-app-c64be.firebaseapp.com",
  projectId: "inmobiliaria-app-c64be",
  storageBucket: "inmobiliaria-app-c64be.firebasestorage.app",
  messagingSenderId: "890257301925",
  appId: "1:890257301925:web:efbb0f7749fc765f54484c"
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

export const db = getFirestore(app);