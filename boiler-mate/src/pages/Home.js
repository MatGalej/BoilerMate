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
    <div class="background">
        <h1>HELLO!</h1>
    </div>
  );
};

export default Home;
