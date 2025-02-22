import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection, query, where, getDocs,
  addDoc, doc, updateDoc, deleteDoc,
  arrayUnion, arrayRemove, onSnapshot,
  serverTimestamp
} from "firebase/firestore";

const Chat = () => {
  const currentUser = auth.currentUser;
  const [friends, setFriends] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const [friendSearch, setFriendSearch] = useState("");
  const [filteredFriends, setFilteredFriends] = useState([]);

  // For adding new friend to chat
  const [newFriendToAdd, setNewFriendToAdd] = useState("");

  // For renaming the chat
  const [newChatName, setNewChatName] = useState("");

  // Store chat members as an array of objects: [{ uid, username }, ...]
  const [chatMembers, setChatMembers] = useState([]);

  // Store chat owner as a UID
  const [chatOwner, setChatOwner] = useState("");

  // For selecting which member to remove (will be a UID)
  const [memberToRemove, setMemberToRemove] = useState("");

  // For error messages
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchFriends();
    }
  }, [currentUser]);

  // 📌 Fetch Friends List (using usernames)
  const fetchFriends = async () => {
    try {
      const userDoc = await getDocs(
        query(collection(db, "users"), where("uid", "==", currentUser.uid))
      );
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        const friendIds = userData.friends || [];

        // Convert each friend UID to a username
        const friendData = await Promise.all(
          friendIds.map(async (friendId) => {
            const friendSnap = await getDocs(
              query(collection(db, "users"), where("uid", "==", friendId))
            );
            if (!friendSnap.empty) {
              return friendSnap.docs[0].data().username;
            }
            return null;
          })
        );

        setFriends(friendData.filter((name) => name !== null));
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  // 📌 Search Friends by Username
  useEffect(() => {
    setFilteredFriends(
      friends.filter((friend) =>
        friend.toLowerCase().includes(friendSearch.toLowerCase())
      )
    );
  }, [friendSearch, friends]);

  // 📌 Get or Create Chat by Friend's Username
  const getOrCreateChat = async (friendUsername) => {
    try {
      // 1) Find friend's UID
      const friendSnap = await getDocs(
        query(collection(db, "users"), where("username", "==", friendUsername))
      );
      if (friendSnap.empty) return alert("User not found!");
      const friendId = friendSnap.docs[0].data().uid;

      // 2) Check if a chat with both UIDs already exists
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("members", "array-contains", currentUser.uid));
      const chatSnapshot = await getDocs(q);

      let existingChat = null;
      chatSnapshot.forEach((docSnap) => {
        const chatData = docSnap.data();
        if (chatData.members.includes(friendId)) {
          existingChat = { id: docSnap.id, ...chatData };
        }
      });

      // 3) If chat exists, pick it
      if (existingChat) {
        setSelectedChat(existingChat.id);
        setSelectedChatName(existingChat.name);
        setChatOwner(existingChat.owner);
        fetchChatMembers(existingChat.members);
        listenForMessages(existingChat.id);
      }
      // 4) If not, create a new one
      else {
        const chatName = prompt("Enter a name for the chat room:");
        const newChatRef = await addDoc(collection(db, "chats"), {
          createdAt: serverTimestamp(),
          members: [currentUser.uid, friendId], // array of UIDs
          messages: [],
          name: chatName,
          owner: currentUser.uid // store the owner as a UID
        });

        setSelectedChat(newChatRef.id);
        setSelectedChatName(chatName);
        setChatOwner(currentUser.uid);
        fetchChatMembers([currentUser.uid, friendId]);
        listenForMessages(newChatRef.id);
      }
    } catch (error) {
      console.error("Error getting or creating chat:", error);
    }
  };

  // 📌 Fetch Chat Members as array of { uid, username }
  const fetchChatMembers = async (memberIds) => {
    try {
      const membersData = await Promise.all(
        memberIds.map(async (mId) => {
          const memberSnap = await getDocs(
            query(collection(db, "users"), where("uid", "==", mId))
          );
          if (!memberSnap.empty) {
            const memberDoc = memberSnap.docs[0].data();
            return { uid: memberDoc.uid, username: memberDoc.username };
          }
          return null;
        })
      );
      setChatMembers(membersData.filter((m) => m !== null));
    } catch (error) {
      console.error("Error fetching chat members:", error);
    }
  };

  // 📌 Listen for Messages in Real Time
  const listenForMessages = (chatId) => {
    const chatRef = doc(db, "chats", chatId);
    return onSnapshot(chatRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.data();
        const messageData = chatData.messages || [];

        // Convert sender UIDs to usernames
        const messagesWithNames = await Promise.all(
          messageData.map(async (msg) => {
            const senderSnap = await getDocs(
              query(collection(db, "users"), where("uid", "==", msg.sender))
            );
            const senderName = senderSnap.empty
              ? "Unknown"
              : senderSnap.docs[0].data().username;
            return { ...msg, senderName };
          })
        );

        setMessages(messagesWithNames);

        // Update members & owner, in case someone else changed them
        if (chatData.members) {
          fetchChatMembers(chatData.members);
        }
        setChatOwner(chatData.owner);
      }
    });
  };

  // 📌 Send a Message
  const sendMessage = async () => {
    if (!selectedChat || !messageInput.trim()) return;

    const chatRef = doc(db, "chats", selectedChat);
    const newMessage = {
      messageID: new Date().getTime().toString(),
      sender: currentUser.uid,
      text: messageInput,
      time: new Date()
    };

    try {
      await updateDoc(chatRef, {
        messages: arrayUnion(newMessage)
      });
      setMessageInput(""); // clear input
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // 📌 Add Friend to Existing Chat by Username
  const addFriendToChat = async () => {
    if (!selectedChat || !newFriendToAdd.trim()) return;

    try {
      const friendSnap = await getDocs(
        query(collection(db, "users"), where("username", "==", newFriendToAdd))
      );
      if (friendSnap.empty) return alert("User not found!");

      const newUserId = friendSnap.docs[0].data().uid;
      const chatRef = doc(db, "chats", selectedChat);

      await updateDoc(chatRef, {
        members: arrayUnion(newUserId)
      });

      alert("Friend added to chat!");
      setNewFriendToAdd("");

      // Also update local chatMembers
      const updatedMembers = [
        ...chatMembers,
        { uid: newUserId, username: newFriendToAdd }
      ];
      setChatMembers(updatedMembers);
    } catch (error) {
      console.error("Error adding friend to chat:", error);
    }
  };

  // 📌 Remove Member (with owner handoff logic)
  const removeMemberFromChat = async () => {
    if (!selectedChat || !memberToRemove) {
      setErrorMessage("Please select a member to remove.");
      return;
    }
    setErrorMessage("");

    // If the user being removed is the same as the chat's owner
    const isOwnerRemovingSelf = memberToRemove === chatOwner;

    // If there's only 1 member total (the owner) and they remove themselves => delete the chat
    if (chatMembers.length === 1 && isOwnerRemovingSelf) {
      try {
        await deleteDoc(doc(db, "chats", selectedChat));
        alert("Chat room deleted (the last member was the owner).");

        // Reset local state
        setSelectedChat(null);
        setSelectedChatName("");
        setChatOwner("");
        setChatMembers([]);
        setMessages([]);
        setMemberToRemove("");
      } catch (error) {
        console.error("Error deleting chat room:", error);
      }
      return;
    }

    // Otherwise, remove the member from the 'members' array
    try {
      const chatRef = doc(db, "chats", selectedChat);
      await updateDoc(chatRef, {
        members: arrayRemove(memberToRemove)
      });

      // Update local state
      const updatedMembers = chatMembers.filter(
        (m) => m.uid !== memberToRemove
      );
      setChatMembers(updatedMembers);

      // If the owner left, pick the first remaining member as new owner
      if (isOwnerRemovingSelf && updatedMembers.length > 0) {
        const newOwnerUid = updatedMembers[0].uid;
        await updateDoc(chatRef, { owner: newOwnerUid });
        setChatOwner(newOwnerUid);
        alert(
          `Owner left. ${updatedMembers[0].username} is now the new owner!`
        );
      } else {
        alert("Member removed from chat!");
      }

      setMemberToRemove("");
    } catch (error) {
      console.error("Error removing member from chat:", error);
    }
  };

  // 📌 Update Chat Name
  const updateChatName = async () => {
    if (!selectedChat || !newChatName.trim()) return;

    try {
      const chatRef = doc(db, "chats", selectedChat);
      await updateDoc(chatRef, { name: newChatName });
      alert("Chat room name updated!");
      setSelectedChatName(newChatName);
      setNewChatName("");
    } catch (error) {
      console.error("Error updating chat room name:", error);
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat</h2>

      {/* 🔍 Search Friends */}
      <input
        type="text"
        placeholder="Search friends..."
        value={friendSearch}
        onChange={(e) => setFriendSearch(e.target.value)}
      />
      <div>
        {filteredFriends.map((friendUsername) => (
          <div key={friendUsername}>
            <button onClick={() => getOrCreateChat(friendUsername)}>
              Chat with {friendUsername}
            </button>
          </div>
        ))}
      </div>

      {/* 💬 Chat Window */}
      {selectedChat && (
        <div className="chat-box">
          <h3>Chat Room: {selectedChatName}</h3>
          <p>
            <strong>Members:</strong>{" "}
            {chatMembers.map((m) => m.username).join(", ")}
          </p>
          <div className="messages">
            {messages.map((msg) => (
              <p key={msg.messageID}>
                <strong>{msg.senderName}:</strong> {msg.text}{" "}
                <span>
                  ({new Date(msg.time.seconds * 1000).toLocaleTimeString()})
                </span>
              </p>
            ))}
          </div>

          {/* 📩 Message Input */}
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>

          {/* ➕ Add Friend to Chat */}
          <input
            type="text"
            placeholder="Enter friend's username to add..."
            value={newFriendToAdd}
            onChange={(e) => setNewFriendToAdd(e.target.value)}
          />
          <button onClick={addFriendToChat}>Add Friend</button>

          {/* ✏️ Update Chat Name */}
          <input
            type="text"
            placeholder="Set the chat room name..."
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
          />
          <button onClick={updateChatName}>Update Chat Name</button>

          {/* ➖ Remove Member (owner has special rights) */}
          {currentUser.uid === chatOwner && (
            <div>
              <select
                value={memberToRemove}
                onChange={(e) => setMemberToRemove(e.target.value)}
              >
                <option value="">Select member to remove</option>
                {chatMembers.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.username}
                  </option>
                ))}
              </select>
              <button onClick={removeMemberFromChat}>Remove Member</button>
              {errorMessage && (
                <p className="error-message">{errorMessage}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
