import { firestore } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Creates a user profile in Firestore.
 * @param {string} userID - The unique user ID from Firebase Authentication.
 * @param {object} userData - The user's profile data.
 */
export const createUserProfile = async (userID, userData) => {
  try {
    const userRef = doc(firestore, "users", userID);
    await setDoc(userRef, {
      ...userData,
      matches: [], // Initialize matches as an empty array
    });
    console.log("User profile created successfully!");
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

/**
 * Retrieves a user profile from Firestore.
 * @param {string} userID - The unique user ID.
 * @returns {object|null} The user's profile data or null if not found.
 */
export const getUserProfile = async (userID) => {
  try {
    const userRef = doc(firestore, "users", userID);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
