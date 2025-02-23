// src/pages/Friends.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import "../css/Friends.css";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [blockedFriends, setBlockedFriends] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("");

  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchFriendRequests();
      fetchFriendsList();
      fetchBlockedFriends();
    }
  }, [currentUser]);

  // 🔍 Optimized User Search with Range Query (now includes blocked users)
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
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id === currentUser.uid) return; // skip self

        const userData = {
          id: docSnap.id,
          ...docSnap.data(),
          isFriend: friendsList.some((friend) => friend.id === docSnap.id),
          isBlocked: blockedFriends.includes(docSnap.id),
        };
        results.push(userData);
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // 📥 Fetch Friend Requests Received
  const fetchFriendRequests = async () => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const requestIds = userDoc.data().friendRequestReceived || [];
        const requestUsers = await Promise.all(
          requestIds.map(async (userId) => {
            const userSnap = await getDoc(doc(db, "users", userId));
            return userSnap.exists()
              ? { id: userId, username: userSnap.data().username }
              : null;
          })
        );
        setFriendRequests(requestUsers.filter((u) => u !== null));
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  // 👫 Fetch Friends List
  const fetchFriendsList = async () => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const friendIds = userDoc.data().friends || [];
        const friendsData = await Promise.all(
          friendIds.map(async (fid) => {
            const friendSnap = await getDoc(doc(db, "users", fid));
            return friendSnap.exists()
              ? { id: fid, username: friendSnap.data().username }
              : null;
          })
        );
        setFriendsList(
          friendsData.filter((f) => f !== null && !blockedFriends.includes(f.id))
        );
      }
    } catch (error) {
      console.error("Error fetching friends list:", error);
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

  // 🤝 Send Friend Request
  const sendFriendRequest = async (userId) => {
    if (!currentUser) return;

    const senderRef = doc(db, "users", currentUser.uid);
    const receiverRef = doc(db, "users", userId);

    try {
      await updateDoc(senderRef, {
        friendRequestSent: arrayUnion(userId),
      });

      await updateDoc(receiverRef, {
        friendRequestReceived: arrayUnion(currentUser.uid),
      });

      alert("Friend request sent!");
      setSearchResults([]); // Clear search results
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // ✅ Accept Friend Request
  const acceptFriendRequest = async (userId) => {
    if (!userId) return alert("No user selected!");
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const senderRef = doc(db, "users", userId);

    try {
      await updateDoc(userRef, {
        friends: arrayUnion(userId),
        friendRequestReceived: arrayRemove(userId),
      });

      await updateDoc(senderRef, {
        friends: arrayUnion(currentUser.uid),
        friendRequestSent: arrayRemove(currentUser.uid),
      });

      setFriendRequests(friendRequests.filter((u) => u.id !== userId));
      setSelectedRequest("");
      fetchFriendsList();
      alert("Friend request accepted! You are now friends.");
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  // 🚫 Block Friend
  const blockFriend = async (userId) => {
    if (!userId) return alert("No user selected!");
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);

    try {
      await updateDoc(userRef, {
        blockedFriends: arrayUnion(userId),
        friends: arrayRemove(userId),
        friendRequestReceived: arrayRemove(userId), // remove if present in requests
      });

      setFriendRequests(friendRequests.filter((u) => u.id !== userId));
      setSelectedRequest("");
      setFriendsList(friendsList.filter((f) => f.id !== userId));
      setBlockedFriends([...blockedFriends, userId]);
      alert("User blocked.");
      setSearchResults([]); // Clear search results
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  // ♻️ Unblock Friend
  const unblockFriend = async (userId) => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(userRef, {
        blockedFriends: arrayRemove(userId),
      });
      setBlockedFriends(blockedFriends.filter((id) => id !== userId));
      alert("User unblocked.");
      setSearchResults([]); // Clear search results
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  return (
    <div className="friends-page">
      <h2 className="friends-header">Find Friends</h2>

      <div className="friends-content">
        {/* Left Column: Friend Requests */}
        <div className="friends-left">
          <h3>Friend Requests</h3>
          <div className="pending-requests-box">
            {friendRequests.length > 0 ? (
              <>
                <select
                  value={selectedRequest}
                  onChange={(e) => setSelectedRequest(e.target.value)}
                >
                  <option value="">Select user</option>
                  {friendRequests.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
                <div className="request-actions">
                  <button onClick={() => acceptFriendRequest(selectedRequest)}>
                    Add
                  </button>
                  <button onClick={() => blockFriend(selectedRequest)}>
                    Block
                  </button>
                </div>
              </>
            ) : (
              <p>No pending friend requests</p>
            )}
          </div>
        </div>

        {/* Middle Column: Search */}
        <div className="friends-middle">
          <h3>Search</h3>
          <input
            type="text"
            placeholder="Search by username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={() => navigate("/home")}>Back</button>

          <h3>Search Results</h3>
          <div className="search-results-box">
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div key={user.id} className="friend-card">
                  <p>{user.username}</p>
                  {user.isBlocked ? (
                    <button onClick={() => unblockFriend(user.id)}>
                      Unblock
                    </button>
                  ) : (
                    <>
                      {user.isFriend ? (
                        <p>✅ Already your friend</p>
                      ) : (
                        <button onClick={() => sendFriendRequest(user.id)}>
                          Add Friend
                        </button>
                      )}
                      <button onClick={() => blockFriend(user.id)}>
                        Block
                      </button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p>No users found</p>
            )}
          </div>
        </div>

        {/* Right Column: Your Friends */}
        <div className="friends-right">
          <h3>Your Friends</h3>
          <div className="friends-list">
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
    </div>
  );
};

export default Friends;
