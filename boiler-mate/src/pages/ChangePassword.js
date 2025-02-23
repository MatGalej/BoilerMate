import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/changePassword.css";

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
    <div className="welcome-background">
      <div className="change-password-container">
        <h2>Change Password</h2>
        {emailSent ? (
          <p>
            An email has been sent to your email address with instructions on
            how to reset your password.
          </p>
        ) : (
          <p>Sending email...</p>
        )}
        <button onClick={() => navigate("/profile")} className="back-btn">
          Back to Profile
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
