import { firestore } from "../firebaseConfig";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

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
const computeMatchScore = (user1, user2) => {
  let score = 0;
  let totalWeight = 0;

  for (const [factor, weight] of Object.entries(WEIGHTS)) {
    if (user1[factor] !== undefined && user2[factor] !== undefined) {
      const isCategorical = typeof user1[factor] === "string";
      const similarity = calculateSimilarity(
        user1[factor],
        user2[factor],
        isCategorical
      );
      score += similarity * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? score / totalWeight : 0; // Normalize the score
};

/**
 * Finds the best roommate match for a given user.
 */
export const findBestMatch = async (userID) => {
  const usersRef = collection(firestore, "users");
  const currentUserSnap = await getDoc(doc(usersRef, userID));
  if (!currentUserSnap.exists()) return null; // User not found

  const currentUser = currentUserSnap.data();
  let bestMatch = null;
  let highestScore = -1;

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

    if (matchScore > highestScore) {
      highestScore = matchScore;
      bestMatch = { id: userDoc.id, ...potentialMatch, matchScore };
    }
  }

  return bestMatch ? bestMatch : null;
};

/**
 * Stores the best roommate match in Firestore.
 */
export const storeMatch = async (user1ID, user2ID, score) => {
  try {
    const matchID = `${user1ID}_${user2ID}`;
    await setDoc(doc(firestore, "matches", matchID), {
      user1: user1ID,
      user2: user2ID,
      compatibilityScore: score,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Match stored in Firestore!");
  } catch (error) {
    console.error("❌ Error storing match:", error);
  }
};
