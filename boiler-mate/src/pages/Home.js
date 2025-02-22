// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || "User");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="">
      {/* Navigation Bar */}
      <nav className="">
        <button className="">Profile</button>
        <button 
          className="" 
          onClick={() => navigate("/chat")} // Navigates to Chat Page
        >
          Chat
        </button>
        <button className="">Match</button>
        <button 
          className="text-white text-lg font-semibold hover:underline" 
          onClick={() => navigate("/friends")} // Navigates to Friends Page
        >
          Friends
        </button>
        <button className="">Submit</button>
      </nav>

      {/* Welcome Message */}
      <h1 className="">
        Welcome, {username}!
      </h1>
      <p className="">Some Stats here...</p>

      {/* Buttons */}
      <div className="">
        <button
          className=""
          onClick={() => navigate("/roommate-request")}
        >
          🏠 Roommate Request Guide
        </button>

        {/* 🔥 Chat Button */}
        <button
          className=""
          onClick={() => navigate("/chat")}
        >
          💬 Open Chat
        </button>

        <button
          className=""
          onClick={handleLogout}
        >
          🔐 Log Out
        </button>

        {/* 🔥 Manage Friends Button */}
        <button
          className=""
          onClick={() => navigate("/friends")}
        >
          👥 Manage Friends
        </button>
      </div>
    </div>
  );
};

export default Home;
