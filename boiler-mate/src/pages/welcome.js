// src/pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Welcome.css";


const Welcome = () => {
  const navigate = useNavigate();
 
  const handleSignUp = () => {
    navigate("/signup");
  };


  const handleLogIn = () => {
    navigate("/login");
  };


  return (
    <div class="welcome-background">
        <div class="Content-Panel">
            <h1 class="welcome-text">BoilerMates</h1>
            <p class="subtitle">Ditch The Train Wreck</p>
            <div class="button-container">
              <button class="intro-button" id="signup" onClick={handleSignUp}>Sign Up</button>  
              <button class="intro-button" id="login" onClick={handleLogIn}>Log In</button>
            </div>
        </div>
    </div>
  );
};


export default Welcome;