import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "../css/Home.css"; // Import the updated CSS

const Home = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("User");

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
      } else {
        //navigate("/401"); // Redirect to 401 page if user is not authenticated
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="background">
      {/* Navbar at the top */}
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo">BoilerMate</h2>
        </div>
        <div className="nav-right">
          <button className="nav-button" onClick={() => navigate("/profile")}>Profile</button>
          <button className="nav-button" onClick={() => navigate("/match")}>Match</button>
          <button className="nav-button" onClick={() => navigate("/friends")}>Friends</button>
          <button className="nav-button" onClick={() => navigate("/chat")}>Chat</button>
          <button className="nav-button" onClick={() => navigate("/roommate-request")}>
          Request Guide
        </button>
          <button className="logout-btn" onClick={handleLogout}>🔐 Log Out</button>
        </div>
      </nav>

      {/* Welcome Section */}
      <div className="welcome-container">
        <h1 className="welcome-text">Welcome, {firstName}!</h1>
        <p>Ditch The Train Wreck.</p>
      </div>
    </div>
  );
};

export default Home;
