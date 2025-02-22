import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion, onSnapshot, serverTimestamp } from "firebase/firestore";

const Chat = () => {
    const currentUser = auth.currentUser;
    const [friends, setFriends] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [friendSearch, setFriendSearch] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [newFriendToAdd, setNewFriendToAdd] = useState("");

    useEffect(() => {
        if (currentUser) {
            fetchFriends();
        }
    }, [currentUser]);

    // 📌 Fetch Friends List (Now Using Usernames)
    const fetchFriends = async () => {
        try {
            const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", currentUser.uid)));
            if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                const friendIds = userData.friends || [];

                // Get usernames from UIDs
                const friendData = await Promise.all(friendIds.map(async (friendId) => {
                    const friendSnap = await getDocs(query(collection(db, "users"), where("uid", "==", friendId)));
                    if (!friendSnap.empty) {
                        return friendSnap.docs[0].data().username;
                    }
                    return null;
                }));

                setFriends(friendData.filter(name => name !== null));
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    // 📌 Search Friends by Username
    useEffect(() => {
        setFilteredFriends(
            friends.filter((friend) => friend.toLowerCase().includes(friendSearch.toLowerCase()))
        );
    }, [friendSearch, friends]);

    // 📌 Get or Create Chat Room by Username
    const getOrCreateChat = async (friendUsername) => {
        try {
            // Get friend's UID from username
            const friendSnap = await getDocs(query(collection(db, "users"), where("username", "==", friendUsername)));
            if (friendSnap.empty) return alert("User not found!");

            const friendId = friendSnap.docs[0].data().uid;

            const chatsRef = collection(db, "chats");
            const q = query(chatsRef, where("members", "array-contains", currentUser.uid));

            const chatSnapshot = await getDocs(q);
            let existingChat = null;

            chatSnapshot.forEach((doc) => {
                const chatData = doc.data();
                if (chatData.members.includes(friendId)) {
                    existingChat = { id: doc.id, ...chatData };
                }
            });

            if (existingChat) {
                setSelectedChat(existingChat.id);
                listenForMessages(existingChat.id);
            } else {
                const newChatRef = await addDoc(collection(db, "chats"), {
                    createdAt: serverTimestamp(),
                    members: [currentUser.uid, friendId],
                    messages: []
                });

                setSelectedChat(newChatRef.id);
                listenForMessages(newChatRef.id);
            }
        } catch (error) {
            console.error("Error getting or creating chat:", error);
        }
    };

    // 📌 Listen for Live Messages
    const listenForMessages = (chatId) => {
        const chatRef = doc(db, "chats", chatId);
        return onSnapshot(chatRef, async (doc) => {
            if (doc.exists()) {
                const messageData = doc.data().messages || [];

                // Replace sender UIDs with usernames
                const messagesWithNames = await Promise.all(messageData.map(async (msg) => {
                    const senderSnap = await getDocs(query(collection(db, "users"), where("uid", "==", msg.sender)));
                    const senderName = senderSnap.empty ? "Unknown" : senderSnap.docs[0].data().username;
                    return { ...msg, senderName };
                }));

                setMessages(messagesWithNames);
            }
        });
    };

    // 📌 Send Message
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
            setMessageInput(""); // Clear input after sending
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // 📌 Add Friend to Existing Chat by Username
    const addFriendToChat = async () => {
        if (!selectedChat || !newFriendToAdd.trim()) return;

        try {
            // Get friend's UID from username
            const friendSnap = await getDocs(query(collection(db, "users"), where("username", "==", newFriendToAdd)));
            if (friendSnap.empty) return alert("User not found!");

            const newUserId = friendSnap.docs[0].data().uid;

            const chatRef = doc(db, "chats", selectedChat);
            await updateDoc(chatRef, {
                members: arrayUnion(newUserId)
            });
            alert("Friend added to chat!");
            setNewFriendToAdd(""); // Clear input
        } catch (error) {
            console.error("Error adding friend to chat:", error);
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
                        <button onClick={() => getOrCreateChat(friendUsername)}>Chat with {friendUsername}</button>
                    </div>
                ))}
            </div>

            {/* 💬 Chat Window */}
            {selectedChat && (
                <div className="chat-box">
                    <h3>Chat Room: {selectedChat}</h3>
                    <div className="messages">
                        {messages.map((msg) => (
                            <p key={msg.messageID}>
                                <strong>{msg.senderName}:</strong> {msg.text} 
                                <span> ({new Date(msg.time.seconds * 1000).toLocaleTimeString()})</span>
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
                </div>
            )}
        </div>
    );
};

export default Chat;
