// Import only the necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Firebase configuration (Ensure credentials are stored securely)
const firebaseConfig = {
  apiKey: "AIzaSyDhC5QN7LVwa18Xy5hqjmQtkbtOx383PU0",
  authDomain: "boilermate-433b0.firebaseapp.com",
  projectId: "boilermate-433b0",
  storageBucket: "boilermate-433b0.appspot.com", // Fixed typo in storageBucket
  messagingSenderId: "383427196507",
  appId: "1:383427196507:web:22570f1e2efc3bd36df17e",
  measurementId: "G-93FVTQB2RX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services for global use
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null; // Prevent analytics errors in SSR environments
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const realtimeDb = getDatabase(app); // Renamed to avoid duplicate `db` declarations
export const storage = getStorage(app);

export default app;
