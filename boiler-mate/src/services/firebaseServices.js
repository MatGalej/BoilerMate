import { firestore } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

/**
 * Creates a new user profile with only known information, leaving other fields blank for setup.
 * @param {string} userID - The Firebase Authentication UID.
 * @param {string} email - The user's email.
 * @param {string} username - The chosen username.
 */
export const createUserProfile = async (userID, email, username) => {
  try {
    await setDoc(
      doc(firestore, "users", userID),
      {
        uid: userID,
        email: email,
        username: username,
        createdAt: serverTimestamp(), // Timestamp for account creation

        // User profile fields (Left blank for later completion)
        firstName: "",
        lastName: "",
        major: "",
        graduationYear: "",
        roomType: "",
        chats: [],
        hobbies: [],
        smokeDrinkWeed: "",
        sleepSchedule: "",
        earliestClassTime: "",
        sleepTime: "",
        extroversion: "",
        peopleOver: "",
        studyPreference: "",
        activityLevel: "",
        cleanliness: "",
        friendshipPreference: "",
        musicPreference: "",
        hasSO: "",
        okWithSOInRoom: "",
        allergiesDiet: "",
        roomDecorations: "",
        carOnCampus: "",
        shareCleaningSupplies: "",
        matches: [],
      },
      { merge: true }
    );

    console.log("✅ User profile initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing user profile:", error);
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
