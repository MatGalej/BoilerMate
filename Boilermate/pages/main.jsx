// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhC5QN7LVwa18Xy5hqjmQtkbtOx383PU0",
  authDomain: "boilermate-433b0.firebaseapp.com",
  projectId: "boilermate-433b0",
  storageBucket: "boilermate-433b0.firebasestorage.app",
  messagingSenderId: "383427196507",
  appId: "1:383427196507:web:22570f1e2efc3bd36df17e",
  measurementId: "G-93FVTQB2RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);