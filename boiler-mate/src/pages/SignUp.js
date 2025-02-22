import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { createUserProfile } from "../services/firebaseServices"; // ✅ Import Firestore function
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // ✅ Restrict to Purdue emails only
    if (!email.endsWith("@purdue.edu")) {
      setMessage("Only Purdue University emails (@purdue.edu) are allowed.");
      return;
    }

    try {
      // ✅ Create user with email & password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ Send email verification
      await sendEmailVerification(user);

      // ✅ Save user profile to Firestore (using firebaseServices.js)
      await createUserProfile(user.uid, email, username);

      setMessage(
        "A verification email has been sent. Please check your inbox or spam folder."
      );

      // ✅ Redirect to login page after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Purdue Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      <p>{message}</p>
      <p>
        Already have an account?{" "}
        <button type="button" onClick={() => navigate("/login")}>
          Login
        </button>
      </p>
    </div>
  );
}

export default SignUp;
