import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "../css/Home.css"; // Import the updated CSS

const Home = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("User");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
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
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className={`home-container ${menuOpen ? "menu-active" : ""}`}>
      {/* Main Content */}
      <div className="main-content">
        <h1 className="logo-text">
          <span className="bold">Boiler</span>Mate
        </h1>
        <p className="welcome-text">Hello, {firstName}</p>

        {/* Purdue Seal as Navigation Trigger */}
        <img
          src="/assets/purdue-seal.png" // Change this path to match your assets folder
          alt="Purdue Seal"
          className="purdue-seal"
          onClick={() => setMenuOpen(true)}
        />
      </div>

      {/* Fullscreen Navigation Overlay */}
      {menuOpen && (
        <div className="fullscreen-menu">
          <div className="menu-content">
            <button className="close-btn" onClick={() => setMenuOpen(false)}>
              ✕
            </button>
            <nav className="nav-links">
              <button onClick={() => navigate("/profile")}>Profile</button>
              <button onClick={() => navigate("/match")}>Match</button>
              <button onClick={() => navigate("/friends")}>Friends</button>
              <button onClick={() => navigate("/chat")}>Chat</button>
              <button onClick={() => navigate("/roommate-request")}>
                Request Guide
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                🔐 Log Out
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
