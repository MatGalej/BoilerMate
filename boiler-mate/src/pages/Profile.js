import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "../css/Profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      {/* Profile Card */}
      <div className={`profile-card ${isFlipped ? "flipped" : ""}`}>
        
        {/* Front Side */}
        <div className="profile-front">
          <img 
            src={userData.profilePic || "https://via.placeholder.com/150"} 
            alt="Profile"
            className="profile-pic"
          />
          <h2>{userData.firstName} {userData.lastName}</h2>
          <p>🎓 {userData.graduationYear}</p>
          <p>📚 {userData.major}</p>
          <p>🛏️ {userData.roomType}</p>
          <p>🎵 {userData.musicPreference}</p>

          <button onClick={() => setIsFlipped(true)} className="flip-btn">
            View More Info 🔄
          </button>
          <button onClick={() => navigate("/questionnaire ")} className="edit-btn">
            Edit Info ✏️
          </button>
        </div>

        {/* Back Side */}
        <div className="profile-back">
          <h2>Full Profile Info</h2>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Activity Level:</strong> {userData.activityLevel}</p>
          <p><strong>Dietary Restrictions:</strong> {userData.dietaryRestrictions}</p>
          <p><strong>Earliest Class Time:</strong> {userData.earliestClassTime}</p>
          <p><strong>Extroversion Level:</strong> {userData.extroversion}</p>
          <p><strong>Study Preference:</strong> {userData.preferredStudyLocation}</p>
          <p><strong>Guests Per Day:</strong> {userData.guestsThroughoutDay}</p>
          <p><strong>Sleep Time:</strong> {userData.sleepTime}</p>
          <p><strong>Smoking/Drinking:</strong> {userData.smokeDrinkWeed}</p>

          <button onClick={() => setIsFlipped(false)} className="flip-btn">
            Back 🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
