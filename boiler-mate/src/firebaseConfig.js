// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Ensure you are using the correct Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDckWqLMq4kijQkXpFljy4mmH79PUFUesk",
  authDomain: "boiler-mate.firebaseapp.com",
  projectId: "boiler-mate",
  storageBucket: "boiler-mate.appspot.com",
  messagingSenderId: "962126161413",
  appId: "1:962126161413:web:4fee2ef5d3b879c6509e6c",
  measurementId: "G-3W8Z8EP27Q"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Export Firestore and Auth
export { auth, db };
export default app;
