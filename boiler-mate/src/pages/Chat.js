import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp } from "firebase/firestore";

const Chat = () => {
    const currentUser = auth.currentUser;
    const [friends, setFriends] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedChatName, setSelectedChatName] = useState(""); // Add state for chat name
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [friendSearch, setFriendSearch] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [newFriendToAdd, setNewFriendToAdd] = useState("");
    const [newChatName, setNewChatName] = useState("");
    const [chatMembers, setChatMembers] = useState([]); // Add state for chat members
    const [chatOwner, setChatOwner] = useState(""); // Add state for chat owner
    const [memberToRemove, setMemberToRemove] = useState(""); // Add state for selected member to remove
    const [errorMessage, setErrorMessage] = useState(""); // Add state for error message

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
                setSelectedChatName(existingChat.name); // Set chat name
                setChatOwner(existingChat.owner); // Set chat owner
                fetchChatMembers(existingChat.members); // Fetch chat members
                listenForMessages(existingChat.id);
            } else {
                const chatName = prompt("Enter a name for the chat room:"); // Prompt user for chat room name
                const newChatRef = await addDoc(collection(db, "chats"), {
                    createdAt: serverTimestamp(),
                    members: [currentUser.uid, friendId],
                    messages: [],
                    name: chatName, // Add chat room name to the document
                    owner: currentUser.uid // Set the current user as the owner
                });

                setSelectedChat(newChatRef.id);
                setSelectedChatName(chatName); // Set chat name
                setChatOwner(currentUser.uid); // Set chat owner
                fetchChatMembers([currentUser.uid, friendId]); // Fetch chat members
                listenForMessages(newChatRef.id);
            }
        } catch (error) {
            console.error("Error getting or creating chat:", error);
        }
    };

    // 📌 Fetch Chat Members
    const fetchChatMembers = async (memberIds) => {
        try {
            const memberData = await Promise.all(memberIds.map(async (memberId) => {
                const memberSnap = await getDocs(query(collection(db, "users"), where("uid", "==", memberId)));
                if (!memberSnap.empty) {
                    return memberSnap.docs[0].data().username;
                }
                return null;
            }));

            setChatMembers(memberData.filter(name => name !== null));
        } catch (error) {
            console.error("Error fetching chat members:", error);
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
            fetchChatMembers([...chatMembers, newUserId]); // Update chat members
        } catch (error) {
            console.error("Error adding friend to chat:", error);
        }
    };

    // 📌 Remove Member from Chat
    const removeMemberFromChat = async () => {
        if (!selectedChat || !memberToRemove) {
            setErrorMessage("Please select a member to remove.");
            return;
        }
        if (chatMembers.length <= 1 || memberToRemove === chatOwner) {
            setErrorMessage("Cannot remove the last member or the owner.");
            return;
        }

        try {
            const chatRef = doc(db, "chats", selectedChat);
            await updateDoc(chatRef, {
                members: arrayRemove(memberToRemove)
            });
            alert("Member removed from chat!");
            setChatMembers(chatMembers.filter(member => member !== memberToRemove)); // Update chat members
            setMemberToRemove(""); // Clear selected member
            setErrorMessage(""); // Clear error message
        } catch (error) {
            console.error("Error removing member from chat:", error);
        }
    };

    // 📌 Update Chat Room Name
    const updateChatName = async () => {
        if (!selectedChat || !newChatName.trim()) return;

        try {
            const chatRef = doc(db, "chats", selectedChat);
            await updateDoc(chatRef, {
                name: newChatName
            });
            alert("Chat room name updated!");
            setSelectedChatName(newChatName); // Update chat name in state
            setNewChatName(""); // Clear input
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
                        <button onClick={() => getOrCreateChat(friendUsername)}>Chat with {friendUsername}</button>
                    </div>
                ))}
            </div>

            {/* 💬 Chat Window */}
            {selectedChat && (
                <div className="chat-box">
                    <h3>Chat Room: {selectedChatName}</h3> {/* Display chat room name */}
                    <p>Members: {chatMembers.join(", ")}</p> {/* Display chat members */}
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

                    {/* ➕ Set Chat Name */}
                    <input
                        type="text"
                        placeholder="Set the chat room name..."
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                    />
                    <button onClick={updateChatName}>Update Chat Name</button>

                    {/* ➖ Remove Member from Chat */}
                    {currentUser.uid === chatOwner && (
                        <div>
                            <select
                                value={memberToRemove}
                                onChange={(e) => setMemberToRemove(e.target.value)}
                            >
                                <option value="">Select member to remove</option>
                                {chatMembers.map((memberId) => (
                                    <option key={memberId} value={memberId}>
                                        {memberId}
                                    </option>
                                ))}
                            </select>
                            <button onClick={removeMemberFromChat}>Remove Member</button>
                            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chat;
