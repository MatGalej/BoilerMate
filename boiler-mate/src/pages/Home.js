import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "../css/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("User");
  const [navOpen, setNavOpen] = useState(false); // Control Navigation Overlay

  useEffect(() => {
    const checkUserLoggedIn = () => {
      if (!auth.currentUser) {
        navigate("/");
      }
    };

    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setFirstName(userDoc.data().firstName || "User");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    checkUserLoggedIn();
    fetchUserData();
  }, [navigate]);

  // ✅ Listen for Esc key to close the navigation menu
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && navOpen) {
        setNavOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navOpen]); // Only runs when `navOpen` changes

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="home-container">
      {/* Welcome Section */}
      <h1 className="welcome-text-home">BoilerMates</h1>
      <p className="welcome-message">Hello, {firstName}</p>

      {/* Purdue Seal (Click to Open Nav) */}
      <img
        src="/purdueSeal.png"
        alt="Purdue Seal"
        className="purdue-seal"
        onClick={() => setNavOpen(true)}
      />

      {/* NAVIGATION OVERLAY */}
      <div className={`nav-overlay ${navOpen ? "active" : ""}`}>
        <div className="navbar">
          {/* Close Button */}
          <span className="close-nav" onClick={() => setNavOpen(false)}>
            ✖
          </span>

          {/* Navigation Links */}
          <div className="nav-button-container">
            <button className="nav-button" onClick={() => navigate("/profile")}>
              Profile
            </button>
            <button className="nav-button" onClick={() => navigate("/match")}>
              Match
            </button>
            <button className="nav-button" onClick={() => navigate("/friends")}>
              Friends
            </button>
            <button className="nav-button" onClick={() => navigate("/chat")}>
              Chat
            </button>
            <button
              className="nav-button"
              onClick={() => navigate("/roommate-request")}
            >
              Request Guide
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
