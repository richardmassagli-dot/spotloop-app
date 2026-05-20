import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ──────────────────────────────────────────────────────────────────
// SETUP ANLEITUNG
// 1. Gehe zu https://console.firebase.google.com
// 2. Neues Projekt erstellen: "myspot-app"
// 3. Web-App hinzufügen (</> Symbol)
// 4. Authentication aktivieren → Sign-in Method → Email/Password
// 5. Firestore Database erstellen → Start in test mode
// 6. Die Konfigurationswerte unten eintragen
// ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "DEINE_API_KEY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "DEIN_PROJEKT.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "DEIN_PROJEKT_ID",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "DEIN_PROJEKT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "DEINE_SENDER_ID",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "DEINE_APP_ID",
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
