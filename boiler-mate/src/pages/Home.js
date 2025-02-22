// src/pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#D4C3A3]">
      <h1 className="text-5xl font-bold italic text-white">BoilerMate</h1>
      <p className="text-lg text-gray-700">Ditch The Train Wreck</p>

      <div className="mt-10 space-y-4">
        <button
          className="w-60 py-3 bg-yellow-600 text-white text-lg font-semibold rounded-md shadow-md hover:bg-yellow-700"
          onClick={() => navigate("/profile")}
        >
          Go to Profile
        </button>

        <button
          className="w-60 py-3 bg-gray-700 text-white text-lg font-semibold rounded-md shadow-md hover:bg-gray-800"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Home;
