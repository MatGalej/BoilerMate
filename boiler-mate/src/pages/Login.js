// src/pages/Login.js
import React, { useState } from "react";
import { auth } from "../firebaseConfig"; // ✅ Correct Firebase import
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        setErrorMessage("Please verify your email before logging in.");
      } else {
        navigate("/home");
      }
    } catch (error) {
      setErrorMessage(error.message);
      console.error("Error logging in:", error.message);
    }
  };

  return (
    <div className="overlay">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Purdue Email" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
        <p className="signup-link">Don't have an account? <button type="button" onClick={() => navigate("/signup")} className="back-button">Sign Up</button></p>
      </div>
    </div>
  );
};

export default Login;
