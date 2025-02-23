// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import "../css/Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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
            const data = userDoc.data();
            // Check if profilePic exists and is not empty
            if (data.profilePic && data.profilePic.trim() !== "") {
              data.profilePic = `data:image/jpeg;base64,${data.profilePic}`;
            } else {
              data.profilePic = "/boiler-mate/public/default-icon.svg";
              console.log("No profile picture found for user:", auth.currentUser.uid);
            }
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    checkUserLoggedIn();
    fetchUserData();
  }, []);

  if (!userData) return <p>Loading...</p>;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };
  return (
    <div className="welcome-background">
      <span className="close-btn" onClick={() => navigate("/home")}>
        ✖
      </span>
      <div className="profile-container">
        {/* Profile Card with Flip Function */}
        <div className={`profile-card ${isFlipped ? "flipped" : ""}`}>
          {/* Front Side */}
          <div className="profile-front">
            <img
              src={userData.profilePic}
              alt=""
              className="profile-pic"
            />
            <h2 className="profile-name text-gray">
              {userData.firstName} {userData.lastName}
            </h2>
            <p className="card-text">Major: {userData.major}</p>
            <p className="card-text">Sleep Time: {userData.sleepTime}</p>
            <p className="card-text">Smoking/Drinking: {userData.smokeDrinkWeed}</p>
            <p className="card-text">Personality: {userData.extroversion}</p>

            <button onClick={() => setIsFlipped(true)} className="flip-btn small-btn">
              More Info
            </button>
            <button onClick={() => navigate("/questionnaire")} className="edit-btn">
              Edit Info
            </button>
          </div>

          {/* Back Side */}
          <div className="profile-back">
            <h2 className="profile-back-title">More Info</h2>
            <p className="card-text">
              <strong>Email:</strong> {userData.email}
            </p>
            <p className="card-text">
              <strong>Activity Level:</strong> {userData.activityLevel}
            </p>
            <p className="card-text">
              <strong>Cleanliness:</strong> {userData.cleanliness}
            </p>
            <p className="card-text">
              <strong>Dietary Restrictions:</strong> {userData.dietaryRestrictions}
            </p>
            <p className="card-text">
              <strong>Earliest Class Time:</strong> {userData.earliestClassTime}
            </p>
            <p className="card-text">
              <strong>Extroversion:</strong> {userData.extroversion}
            </p>
            <p className="card-text">
              <strong>Friendship Preference:</strong> {userData.friendshipPreference}
            </p>
            <p className="card-text">
              <strong>Graduation Year:</strong> {userData.graduationYear}
            </p>
            <p className="card-text">
              <strong>Guests Throughout Day:</strong> {userData.guestsThroughoutDay}
            </p>
            <p className="card-text">
              <strong>Hobbies:</strong> {userData.hobbies}
            </p>
            <p className="card-text">
              <strong>Music Preference:</strong> {userData.musicPreference}
            </p>
            <p className="card-text">
              <strong>Overnight Stay:</strong> {userData.overnightStay}
            </p>
            <p className="card-text">
              <strong>People Over:</strong> {userData.peopleOver}
            </p>
            <p className="card-text">
              <strong>Preferred Study Location:</strong> {userData.preferredStudyLocation}
            </p>
            <p className="card-text">
              <strong>Room Decorations:</strong> {userData.roomDecorations}
            </p>
            <p className="card-text">
              <strong>Room Type:</strong> {userData.roomType}
            </p>
            <p className="card-text">
              <strong>Share Cleaning Supplies:</strong> {userData.shareCleaningSupplies}
            </p>
            <p className="card-text">
              <strong>Sleep Time:</strong> {userData.sleepTime}
            </p>
            <p className="card-text">
              <strong>Smoking/Drinking:</strong> {userData.smokeDrinkWeed}
            </p>
            <p className="card-text">
              <strong>Study Preference:</strong> {userData.studyPreference}
            </p>

            <button onClick={() => setIsFlipped(false)} className="flip-btn small-btn">
              Back
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="profile-sidebar">
          <button onClick={() => navigate("/change-password")} className="sidebar-btn">
            Change Password
          </button>
          <button onClick={() => navigate("/change-username")} className="sidebar-btn">
            Change Username
          </button>
          <button onClick={handleLogout} className="sidebar-btn logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
