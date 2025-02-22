import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      const email = auth.currentUser.email;

      sendPasswordResetEmail(auth, email)
        .then(() => {
          setEmailSent(true);
        })
        .catch((error) => {
          console.error("Error sending reset email:", error);
          alert("Failed to send reset email. Please try again.");
        });
    } else {
      alert("No user signed in. Redirecting...");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Change Password</h2>
      {emailSent ? (
        <p>A password reset email has been sent to your registered email.</p>
      ) : (
        <p>Sending password reset email...</p>
      )}
      <button onClick={() => navigate("/profile")} className="sidebar-btn">
        Back to Profile
      </button>
    </div>
  );
};

export default ChangePassword;
