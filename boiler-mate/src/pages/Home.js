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
    <div className="background flex flex-col items-center justify-center min-h-screen">
      {/* Navigation Bar */}
      <nav className="w-full flex justify-center space-x-6 py-4 bg-gray-700 rounded-lg shadow-lg">
        <button className="text-white text-lg font-semibold hover:underline">Profile</button>
        <button className="text-white text-lg font-semibold hover:underline">Chat</button>
        <button className="text-white text-lg font-semibold hover:underline">Match</button>
        <button 
          className="text-white text-lg font-semibold hover:underline" 
          onClick={() => navigate("/friends")} // Navigates to Friends Page
        >
          Friends
        </button>
        <button className="text-white text-lg font-semibold hover:underline">Submit</button>
      </nav>

      {/* Welcome Message */}
      <h1 className="text-5xl italic font-bold text-white mt-10">
        Welcome, {username}!
      </h1>
      <p className="italic text-lg text-gray-800 mt-4">Some Stats here...</p>

      {/* Buttons */}
      <div className="mt-10 flex flex-col space-y-4">
        <button
          className="w-60 py-3 bg-yellow-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-700"
          onClick={() => navigate("/roommate-request")}
        >
          🏠 Roommate Request Guide
        </button>

        <button
          className="w-60 py-3 bg-gray-700 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-gray-800"
          onClick={handleLogout}
        >
          🔐 Log Out
        </button>

        {/* 🔥 Add Friends Button */}
        <button
          className="w-60 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700"
          onClick={() => navigate("/friends")}
        >
          👥 Manage Friends
        </button>
      </div>
    </div>
  );
};

export default Home;
