import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../css/changeUsername.css";

const ChangeUsername = () => {
  const [userData, setUserData] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChangeUsername = async () => {
    if (!newUsername) {
      setError("Username cannot be empty");
      return;
    }

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { username: newUsername });
      setSuccess("Username updated successfully");
      setError("");
      setUserData((prevData) => ({ ...prevData, username: newUsername }));
      setTimeout(() => {
        navigate("/profile");
      }, 2000); // Redirect to profile after 2 seconds
    } catch (error) {
      setError("Error updating username: " + error.message);
      setSuccess("");
    }
  };

  useEffect(() => {
      const checkUserLoggedIn = () => {
            if (!auth.currentUser) {
              navigate("/");
            }
          };
      checkUserLoggedIn();
    }, []);
    
  return (
    <div className="welcome-background">
      <div className="change-username-container">
      <h2>Change Username</h2>
      <input
        type="text"
        placeholder="New Username"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
      />
      <button onClick={handleChangeUsername} className="change-username-btn">
        Update Username
      </button>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      <button onClick={() => navigate("/profile")} className="back-btn">
        Back to Profile
      </button>
    </div>
    </div>
  );
};

export default ChangeUsername;