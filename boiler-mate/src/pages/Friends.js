import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Friends = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const currentUser = auth.currentUser;
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            fetchFriendRequests();
            fetchFriendsList();
        }
    }, [currentUser]);

    // 🔍 Search Users
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", searchTerm));

        try {
            const querySnapshot = await getDocs(q);
            let results = [];
            querySnapshot.forEach((doc) => {
                if (doc.id !== currentUser.uid) {
                    const userData = { id: doc.id, ...doc.data(), isFriend: friendsList.some(friend => friend.id === doc.id) };
                    results.push(userData);
                }
            });
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching users:", error);
        }
    };

    // 🤝 Send Friend Request
    const sendFriendRequest = async (userId) => {
        if (!currentUser) return;

        const senderRef = doc(db, "users", currentUser.uid);
        const receiverRef = doc(db, "users", userId);

        try {
            await updateDoc(senderRef, {
                friendRequestSent: arrayUnion(userId)
            });

            await updateDoc(receiverRef, {
                friendRequestRecived: arrayUnion(currentUser.uid)
            });

            alert("Friend request sent!");
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    };

    // 📥 Fetch Friend Requests Received
    const fetchFriendRequests = async () => {
        if (!currentUser) return;

        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                const requestIds = userDoc.data().friendRequestRecived || [];
                const requestUsers = await Promise.all(requestIds.map(async (userId) => {
                    const userSnap = await getDoc(doc(db, "users", userId));
                    return userSnap.exists() ? { id: userId, username: userSnap.data().username } : null;
                }));
                setFriendRequests(requestUsers.filter(user => user !== null));
            }
        } catch (error) {
            console.error("Error fetching friend requests:", error);
        }
    };

    // ✅ Accept Friend Request (Adds both users as friends)
    const acceptFriendRequest = async (userId) => {
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid);
        const senderRef = doc(db, "users", userId);

        try {
            await updateDoc(userRef, {
                friends: arrayUnion(userId),
                friendRequestRecived: arrayRemove(userId)
            });

            await updateDoc(senderRef, {
                friends: arrayUnion(currentUser.uid),
                friendRequestSent: arrayRemove(currentUser.uid)
            });

            setFriendRequests(friendRequests.filter((user) => user.id !== userId));
            fetchFriendsList(); // Refresh friends list
            alert("Friend request accepted! You are now friends.");
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };

    // ❌ Decline Friend Request
    const declineFriendRequest = async (userId) => {
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid);
        const senderRef = doc(db, "users", userId);

        try {
            await updateDoc(userRef, {
                friendRequestRecived: arrayRemove(userId)
            });

            await updateDoc(senderRef, {
                friendRequestSent: arrayRemove(currentUser.uid)
            });

            setFriendRequests(friendRequests.filter((user) => user.id !== userId));

            alert("Friend request declined.");
        } catch (error) {
            console.error("Error declining friend request:", error);
        }
    };

    // 👫 Fetch Friends List (Now Shows Usernames Instead of IDs)
    const fetchFriendsList = async () => {
        if (!currentUser) return;

        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                const friendIds = userDoc.data().friends || [];
                const friendsData = await Promise.all(friendIds.map(async (friendId) => {
                    const friendSnap = await getDoc(doc(db, "users", friendId));
                    return friendSnap.exists() ? { id: friendId, username: friendSnap.data().username } : null;
                }));
                setFriendsList(friendsData.filter(friend => friend !== null));
            }
        } catch (error) {
            console.error("Error fetching friends list:", error);
        }
    };

    return (
        <div className="friends-container">
            <h2>Find Friends</h2>
            <input
                type="text"
                placeholder="Search by username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            {/* 🔍 Search Results */}
            <h3>Search Results:</h3>
            <div>
                {searchResults.length > 0 ? (
                    searchResults.map((user) => (
                        <div key={user.id} className="friend-card">
                            <p>{user.username} ({user.email})</p>
                            {user.isFriend ? (
                                <p>✅ Already your friend</p>
                            ) : (
                                <button onClick={() => sendFriendRequest(user.id)}>➕ Send Friend Request</button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No users found</p>
                )}
            </div>

            {/* 📥 Friend Requests Received */}
            <h3>Friend Requests Received:</h3>
            <div>
                {friendRequests.length > 0 ? (
                    friendRequests.map((user) => (
                        <div key={user.id} className="friend-request">
                            <p>{user.username}</p>
                            <button onClick={() => acceptFriendRequest(user.id)}>✅ Accept</button>
                            <button onClick={() => declineFriendRequest(user.id)}>❌ Decline</button>
                        </div>
                    ))
                ) : (
                    <p>No pending requests</p>
                )}
            </div>

            {/* 👫 Friends List */}
            <h3>Your Friends:</h3>
            <div>
                {friendsList.length > 0 ? (
                    friendsList.map((friend) => (
                        <div key={friend.id} className="friend-item">
                            <p>{friend.username}</p>
                        </div>
                    ))
                ) : (
                    <p>No friends yet</p>
                )}
            </div>

            {/* 🏠 Back to Home Button */}
            <button
                className="w-40 py-2 mt-6 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800"
                onClick={() => navigate("/home")}
            >
                ⬅️ Back to Home
            </button>
        </div>
    );
};

export default Friends;
