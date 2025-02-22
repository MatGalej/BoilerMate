import { firestore } from "../firebaseConfig";
import {
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Sends a message in a chat conversation.
 * @param {string} chatID - The chat ID.
 * @param {string} senderID - The sender's user ID.
 * @param {string} text - The message text.
 */
export const sendMessage = async (chatID, senderID, text) => {
  try {
    const messageRef = doc(firestore, "chats", chatID);

    const newMessage = {
      messageID: `${Date.now()}_${senderID}`, // Unique message ID
      sender: senderID,
      text: text,
      time: serverTimestamp(),
    };

    await updateDoc(messageRef, {
      messages: arrayUnion(newMessage), // Append new message
    });

    console.log("✅ Message sent:", text);
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
};

/**
 * Listens for messages in a chat conversation.
 * @param {string} chatID - The chat ID.
 * @param {function} callback - Function to handle new messages.
 * @returns {function} Unsubscribe function to stop listening.
 */
export const listenForMessages = (chatID, callback) => {
  const chatRef = doc(firestore, "chats", chatID);

  const unsubscribe = onSnapshot(chatRef, (snapshot) => {
    if (snapshot.exists()) {
      const chatData = snapshot.data();
      callback(chatData.messages); // Pass messages to callback
    } else {
      console.log("⚠️ Chat not found.");
    }
  });

  return unsubscribe; // Call this function to stop listening
};
