import { firestore } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Creates a match document in Firestore.
 * @param {string} user1 - The first user’s ID.
 * @param {string} user2 - The second user’s ID.
 * @param {number} compatibilityScore - Optional compatibility score.
 */
export const createMatch = async (user1, user2, compatibilityScore = 0) => {
  try {
    const matchID = `${user1}_${user2}`;
    await setDoc(doc(firestore, "matches", matchID), {
      user1,
      user2,
      compatibilityScore,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ Match created: ${matchID}`);
  } catch (error) {
    console.error("❌ Error creating match:", error);
  }
};
