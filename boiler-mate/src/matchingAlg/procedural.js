import { firestore } from "../firebaseConfig";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { aiTextSimilarity } from "./aiMatching";

const WEIGHTS = {
  cleanliness: 3,
  earliestClassTime: 2,
  extroversion: 2,
  friendshipPreference: 2,
  graduationYear: 3,
  overnightStay: 3,
  peopleOver: 2, // Friends Throughout Day
  shareCleaningSupplies: 1,
  sleepTime: 2,
  smokeDrinkWeed: 3,
  activityLevel: 1,
};

const AI_WEIGHTS = {
  roomDecorations: 1,
  studyPreference: 1,
  hobbies: 2,
  musicInRoom: 2,
  dietaryRestrictions: 3,
  major: 2
};

/**
 * Calculates similarity score for a factor.
 * - For 1-10 scale: Uses difference formula.
 * - For categorical: Exact match required.
 */
const calculateSimilarity = (value1, value2, isCategorical = false) => {
  if (isCategorical) return value1 === value2 ? 1 : 0;
  if (!value1 || !value2) return 0; // If value is missing, assume no match
  return 1 - Math.abs(value1 - value2) / 10;
};

/**
 * Computes a weighted match score between two users.
 */
const computeMatchScore = async (user1ID, user2ID) => {
  const usersRef = collection(firestore, "users");
  const currentUser1Snap = await getDoc(doc(usersRef, user1ID));
  const currentUser2Snap = await getDoc(doc(usersRef, user2ID));
  if (!currentUser1Snap.exists() || !currentUser2Snap.exists()) return null; // User not found

  const user1 = currentUser1Snap.data();
  const user2 = currentUser2Snap.data();

  let score = 0;

  score += aiTextSimilarity(user1.major, user2.major) * AI_WEIGHTS.major;
  score += calculateSimilarity(user1.graduationYear, user2.graduationYear) * WEIGHTS.graduationYear;
  score += aiTextSimilarity(user1.hobbies, user2.hobbies) * AI_WEIGHTS.hobbies;
  score += calculateSimilarity(user1.cleanliness, user2.cleanliness) * WEIGHTS.cleanliness;
  score += calculateSimilarity(user1.earliestClassTime, user2.earliestClassTime) * WEIGHTS.earliestClassTime;
  score += aiTextSimilarity(user1.studyPreference, user2.studyPreference) * AI_WEIGHTS.studyPreference;
  score += calculateSimilarity(user1.extroversion, user2.extroversion) * WEIGHTS.extroversion;  
  score += calculateSimilarity(user1.friendshipPreference, user2.friendshipPreference) * WEIGHTS.friendshipPreference;  
  score += aiTextSimilarity(user1.musicInRoom, user2.musicInRoom) * AI_WEIGHTS.musicInRoom;
  score += aiTextSimilarity(user1.dietaryRestrictions, user2.dietaryRestrictions) * AI_WEIGHTS.dietaryRestrictions;
  score += calculateSimilarity(user1.overnightStay, user2.overnightStay) * WEIGHTS.overnightStay;
  score += calculateSimilarity(user1.peopleOver, user2.peopleOver) * WEIGHTS.peopleOver;
  score += calculateSimilarity(user1.shareCleaningSupplies, user2.shareCleaningSupplies) * WEIGHTS.shareCleaningSupplies;
  score += calculateSimilarity(user1.sleepTime, user2.sleepTime) * WEIGHTS.sleepTime;
  score += calculateSimilarity(user1.smokeDrinkWeed, user2.smokeDrinkWeed) * WEIGHTS.smokeDrinkWeed;
  score += calculateSimilarity(user1.activityLevel, user2.activityLevel) * WEIGHTS.activityLevel;
  score += aiTextSimilarity(user1.roomDecorations, user2.roomDecorations) * AI_WEIGHTS.roomDecorations;

  return score;
};

/**
 * Finds the best roommate match for a given user.
 */
export const findBestMatch = async (userID) => {
  const usersRef = collection(firestore, "users");
  const currentUserSnap = await getDoc(doc(usersRef, userID));
  if (!currentUserSnap.exists()) return null; // User not found

  const currentUser = currentUserSnap.data();
  let bestMatch = {};

  const allUsersSnap = await getDocs(usersRef);
  for (const userDoc of allUsersSnap.docs) {
    const potentialMatch = userDoc.data();
    if (
      userDoc.id === userID ||
      currentUser.deniedUsers.includes(userDoc.id) ||
      potentialMatch.roomType !== currentUser.roomType
    ) {
      continue; // Skip self, denied users, or mismatched room types
    }

    const matchScore = computeMatchScore(currentUser, potentialMatch);
    
    bestMatch[potentialMatch.id] = matchScore;

  }
  const entries = Object.entries(bestMatch);
  entries.sort((a, b) => b[1] - a[1]);
  const sortedKeys = entries.map(entry => entry[0]);

  try {
      await updateDoc(doc(firestore, "users", userID), {
        potentialMatches: sortedKeys
      });
      console.log("✅ Match stored in Firestore!");
    } catch (error) {
      console.error("❌ Error storing match:", error);
    }
  return sortedKeys;
};

/**
 * Stores the best roommate match in Firestore.
 */
export const storeMatch = async (user1ID, user2ID, score) => {
};
