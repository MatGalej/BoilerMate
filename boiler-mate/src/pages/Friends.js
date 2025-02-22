import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import "../css/Friends.css";

import { 
    collection, query, where, getDocs, doc, getDoc, updateDoc, 
    arrayUnion, arrayRemove 
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Friends = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [blockedFriends, setBlockedFriends] = useState([]);
    const currentUser = auth.currentUser;
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            fetchFriendRequests();
            fetchFriendsList();
            fetchBlockedFriends();
        }
    }, [currentUser]);

    // 🔍 Optimized User Search with Range Query
    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        const usersRef = collection(db, "users");
        const q = query(
            usersRef,
            where("username", ">=", searchTerm),
            where("username", "<=", searchTerm + "\uf8ff")
        );

        try {
            const querySnapshot = await getDocs(q);
            let results = [];
            querySnapshot.forEach((doc) => {
                if (doc.id !== currentUser.uid && !blockedFriends.includes(doc.id)) {
                    const userData = { 
                        id: doc.id, 
                        ...doc.data(), 
                        isFriend: friendsList.some(friend => friend.id === doc.id) 
                    };
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
                friendRequestReceived: arrayUnion(currentUser.uid)
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
                const requestIds = userDoc.data().friendRequestReceived || [];
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

    // ✅ Accept Friend Request
    const acceptFriendRequest = async (userId) => {
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid);
        const senderRef = doc(db, "users", userId);

        try {
            await updateDoc(userRef, {
                friends: arrayUnion(userId),
                friendRequestReceived: arrayRemove(userId)
            });

            await updateDoc(senderRef, {
                friends: arrayUnion(currentUser.uid),
                friendRequestSent: arrayRemove(currentUser.uid)
            });

            setFriendRequests(friendRequests.filter((user) => user.id !== userId));
            fetchFriendsList();
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
                friendRequestReceived: arrayRemove(userId)
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

    // 👫 Fetch Friends List
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
                setFriendsList(friendsData.filter(friend => friend !== null && !blockedFriends.includes(friend.id)));
            }
        } catch (error) {
            console.error("Error fetching friends list:", error);
        }
    };

    // 🚫 Block Friend
    const blockFriend = async (userId) => {
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid);

        try {
            await updateDoc(userRef, {
                blockedFriends: arrayUnion(userId),
                friends: arrayRemove(userId)
            });

            setFriendsList(friendsList.filter((friend) => friend.id !== userId));
            setBlockedFriends([...blockedFriends, userId]);

            alert("User blocked.");
        } catch (error) {
            console.error("Error blocking user:", error);
        }
    };

    // 🛑 Fetch Blocked Friends
    const fetchBlockedFriends = async () => {
        if (!currentUser) return;

        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                setBlockedFriends(userDoc.data().blockedFriends || []);
            }
        } catch (error) {
            console.error("Error fetching blocked friends:", error);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            {/* Left Side - Existing Content */}
            <div className="friends-container" style={{ width: "65%" }}>
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
                {searchResults.length > 0 ? (
                    searchResults.map((user) => (
                        <div key={user.id} className="friend-card">
                            <p>{user.username}</p>
                            {user.isFriend ? (
                                <p>✅ Already your friend</p>
                            ) : (
                                <button onClick={() => sendFriendRequest(user.id)}>➕ Send Friend Request</button>
                            )}
                            <button onClick={() => blockFriend(user.id)}>🚫 Block</button>
                        </div>
                    ))
                ) : (
                    <p>No users found</p>
                )}
            </div>

            

            {/* Right Side - Friends List */}
            <div className="friends-list-container" style={{ width: "30%", borderLeft: "1px solid #ccc", paddingLeft: "20px" }}>
                <h3>Your Friends</h3>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
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
            </div>
        </div>
    );
};

export default Friends;
