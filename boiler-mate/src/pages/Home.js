// src/pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import "../css/home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="background flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-6">HELLO!</h1>

      {/* 🚀 Button to Roommate Request Guide */}
      <button
        className="w-60 py-3 bg-yellow-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-700 mb-4"
        onClick={() => navigate("/roommate-request")}
      >
        🏠 Roommate Request Guide
      </button>

      {/* Logout Button */}
      <button
        className="w-60 py-3 bg-gray-700 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-gray-800"
        onClick={handleLogout}
      >
        🔐 Log Out
      </button>
    </div>
  );
};

export default Home;
