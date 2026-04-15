import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

// Configuración de tu proyecto Pino
const firebaseConfig = {
  apiKey: "AIzaSyB6Z6JhiVTUZiKmT4mh5I3Pt8hTToD0UDs",
  authDomain: "pino-5fe44.firebaseapp.com",
  projectId: "pino-5fe44",
  storageBucket: "pino-5fe44.firebasestorage.app",
  messagingSenderId: "708518383868",
  appId: "1:708518383868:web:5e960224ca73e3f3eb0779"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios opcionales
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
