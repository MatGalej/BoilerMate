import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection, query, where, getDocs,
  addDoc, doc, updateDoc, deleteDoc,
  arrayUnion, arrayRemove, onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import "../css/Chat.css"; // Make sure you import your new CSS

const Chat = () => {
  const currentUser = auth.currentUser;
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [isValidUser, setIsValidUser] = useState(false);

  const [userChats, setUserChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState("");
  const [chatOwner, setChatOwner] = useState("");
  const [chatMembers, setChatMembers] = useState([]);

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const [newFriendToAdd, setNewFriendToAdd] = useState("");
  const [newChatName, setNewChatName] = useState("");

  const [memberToRemove, setMemberToRemove] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchFriends();
      fetchUserChats();
    }
  }, [currentUser]);

  // Whenever friendSearch changes, check if user exists
  useEffect(() => {
    if (friendSearch) {
      checkUserExists(friendSearch);
    } else {
      setIsValidUser(false);
    }
  }, [friendSearch]);

  // ───────────────────────────────────────────────────────────
  //                       DATA FETCHING
  // ───────────────────────────────────────────────────────────

  const fetchFriends = async () => {
    // ... same logic as before ...
    // sets the "friends" array
    try {
      const userDoc = await getDocs(
        query(collection(db, "users"), where("uid", "==", currentUser.uid))
      );
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        const friendIds = userData.friends || [];

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

  const fetchUserChats = async () => {
    // ... same logic as before ...
    // sets the "userChats" array
    try {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("members", "array-contains", currentUser.uid));
      const chatSnapshot = await getDocs(q);

      const userChatsTemp = [];
      chatSnapshot.forEach((docSnap) => {
        const chatData = docSnap.data();
        userChatsTemp.push({ id: docSnap.id, ...chatData });
      });

      // Verify each member
      const verifiedChats = await Promise.all(
        userChatsTemp.map(async (chat) => {
          const verifiedMembers = await Promise.all(
            chat.members.map(async (memberId) => {
              const memberSnap = await getDocs(
                query(collection(db, "users"), where("uid", "==", memberId))
              );
              return !memberSnap.empty;
            })
          );
          return verifiedMembers.every(Boolean) ? chat : null;
        })
      );

      setUserChats(verifiedChats.filter((c) => c !== null));
    } catch (error) {
      console.error("Error fetching user chats:", error);
    }
  };

  const checkUserExists = async (username) => {
    // ... same logic as before ...
    try {
      const userSnap = await getDocs(
        query(collection(db, "users"), where("username", "==", username))
      );
      setIsValidUser(!userSnap.empty);
    } catch (error) {
      console.error("Error checking user existence:", error);
      setIsValidUser(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  //             GET OR CREATE / SELECT CHAT
  // ───────────────────────────────────────────────────────────

  const getOrCreateChat = async (friendUsername) => {
    // ... same logic as before ...
    // sets "selectedChat", "selectedChatName", "chatOwner", etc.
    try {
      const friendSnap = await getDocs(
        query(collection(db, "users"), where("username", "==", friendUsername))
      );
      if (friendSnap.empty) return alert("User not found!");
      const friendId = friendSnap.docs[0].data().uid;

      // Check if existing chat
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

      if (existingChat) {
        setSelectedChat(existingChat.id);
        setSelectedChatName(existingChat.name || "Unnamed Chat");
        setChatOwner(existingChat.owner);
        fetchChatMembers(existingChat.members);
        listenForMessages(existingChat.id);
      } else {
        const chatName = prompt("Enter a name for the chat room:") || "Unnamed Chat";
        const newChatRef = await addDoc(collection(db, "chats"), {
          createdAt: serverTimestamp(),
          members: [currentUser.uid, friendId],
          messages: [],
          name: chatName,
          owner: currentUser.uid
        });

        setSelectedChat(newChatRef.id);
        setSelectedChatName(chatName);
        setChatOwner(currentUser.uid);
        fetchChatMembers([currentUser.uid, friendId]);
        listenForMessages(newChatRef.id);
        fetchUserChats();
      }
    } catch (error) {
      console.error("Error getting or creating chat:", error);
    }
  };

  const selectChat = async (chatId, chatName) => {
    // ... same logic as before ...
    setSelectedChat(chatId);
    setSelectedChatName(chatName || "Unnamed Chat");
    listenForMessages(chatId);
  };

  // ───────────────────────────────────────────────────────────
  //          FETCH MEMBERS / LISTEN FOR MESSAGES
  // ───────────────────────────────────────────────────────────

  const fetchChatMembers = async (memberIds) => {
    // ... same logic ...
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

        // Update members & owner
        if (chatData.members) {
          fetchChatMembers(chatData.members);
        }
        setChatOwner(chatData.owner);
      }
    });
  };

  // ───────────────────────────────────────────────────────────
  //                 MESSAGE / CHAT ACTIONS
  // ───────────────────────────────────────────────────────────

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
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const addFriendToChat = async () => {
    // ... same logic ...
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

      const updatedMembers = [
        ...chatMembers,
        { uid: newUserId, username: newFriendToAdd }
      ];
      setChatMembers(updatedMembers);
      fetchUserChats();
    } catch (error) {
      console.error("Error adding friend to chat:", error);
    }
  };

  const removeMemberFromChat = async () => {
    // ... same logic with the “owner handoff” ...
    if (!selectedChat || !memberToRemove) {
      setErrorMessage("Please select a member to remove.");
      return;
    }
    setErrorMessage("");

    const isOwnerRemovingSelf = memberToRemove === chatOwner;

    if (chatMembers.length === 1 && isOwnerRemovingSelf) {
      try {
        await deleteDoc(doc(db, "chats", selectedChat));
        alert("Chat room deleted (the last member was the owner).");

        // reset
        setSelectedChat(null);
        setSelectedChatName("");
        setChatOwner("");
        setChatMembers([]);
        setMessages([]);
        setMemberToRemove("");
        fetchUserChats();
      } catch (error) {
        console.error("Error deleting chat room:", error);
      }
      return;
    }

    try {
      const chatRef = doc(db, "chats", selectedChat);
      await updateDoc(chatRef, {
        members: arrayRemove(memberToRemove)
      });

      const updatedMembers = chatMembers.filter(
        (m) => m.uid !== memberToRemove
      );
      setChatMembers(updatedMembers);

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

      if (memberToRemove === currentUser.uid) {
        fetchUserChats();
        setSelectedChat(null);
        setSelectedChatName("");
        setChatOwner("");
        setChatMembers([]);
        setMessages([]);
      }

      setMemberToRemove("");
    } catch (error) {
      console.error("Error removing member from chat:", error);
    }
  };

  const updateChatName = async () => {
    // ... same logic ...
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

  // ───────────────────────────────────────────────────────────
  //                      RENDER
  // ───────────────────────────────────────────────────────────

  return (
    <div className="chat-page">
      <h2 className="chat-header">Chat</h2>

      {/* Top area: Search bar + button(s) if no chat selected */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search friends..."
          value={friendSearch}
          onChange={(e) => setFriendSearch(e.target.value)}
        />
        <div className="search-results">
          {filteredFriends.map((friendUsername) => (
            <div key={friendUsername}>
              <button onClick={() => getOrCreateChat(friendUsername)}>
                Chat with {friendUsername}
              </button>
            </div>
          ))}
          {filteredFriends.length === 0 && friendSearch && isValidUser && (
            <div>
              <button onClick={() => getOrCreateChat(friendSearch)}>
                Create chat with {friendSearch}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* If NO chat is selected, show Chat History */}
      {!selectedChat && (
        <div className="chat-history">
          <h3>Chat History</h3>
          {userChats.map((chat) => (
            <div key={chat.id}>
              <button onClick={() => selectChat(chat.id, chat.name)}>
                {chat.name || "Unnamed Chat"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* If a chat is selected, show the two-column layout */}
      {selectedChat && (
        <div className="chat-content">
          {/* Left column: messages box */}
          <div className="chat-left">
            <div className="chat-info-top">
              <h3>{selectedChatName}</h3>
              <p><strong>Members:</strong> {chatMembers.map(m => m.username).join(", ")}</p>
            </div>
            <div className="messages">
              {messages.map((msg) => (
                <p key={msg.messageID} className="message-line">
                  <strong>{msg.senderName}:</strong> {msg.text}{" "}
                  <span className="timestamp">
                    ({new Date(msg.time.seconds * 1000).toLocaleTimeString()})
                  </span>
                </p>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>

          {/* Right column: Chat settings, add/remove friend, etc. */}
          <div className="chat-right">
            <h4>Chat Settings</h4>

            {currentUser.uid === chatOwner && (
              <div className="owner-controls">
                <div className="add-friend-section">
                  <input
                    type="text"
                    placeholder="Enter friend's username..."
                    value={newFriendToAdd}
                    onChange={(e) => setNewFriendToAdd(e.target.value)}
                  />
                  <button onClick={addFriendToChat}>Add Friend</button>
                </div>
                <div className="remove-friend-section">
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
                  <button onClick={removeMemberFromChat}>Remove</button>
                  {errorMessage && <p className="error-message">{errorMessage}</p>}
                </div>
              </div>
            )}

            <div className="rename-chat-section">
              <input
                type="text"
                placeholder="New chat room name..."
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
              />
              <button onClick={updateChatName}>Rename Chat</button>
            </div>

            <button onClick={() => {
              // "Back" button, resets to chat history
              setSelectedChat(null);
              setSelectedChatName("");
              setChatMembers([]);
              setMessages([]);
            }}>
              Back to Chat List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
