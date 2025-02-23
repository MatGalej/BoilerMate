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
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.profilePic) {
              data.profilePic = `data:image/jpeg;base64,${data.profilePic}`;
              console.log(data.profilePic);
            }
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  if (!userData) return <p>Loading...</p>;

  const handleLogout = async () => {
      await signOut(auth);
      navigate("/");
    };

  return (
    <div className="profile-container">
      {/* Profile Card with Flip Function */}
      <div className={`profile-card ${isFlipped ? "flipped" : ""}`}>
        
        {/* Front Side */}
        <div className="profile-front">
          <img 
            src={userData.profilePic || "https://via.placeholder.com/150"} 
            alt=""
            className="profile-pic"
          />
          <h2 className="profile-name text-gray">{userData.firstName} {userData.lastName}</h2>
          <p><strong>Major:</strong> {userData.major}</p>
          <p><strong>Sleep Time:</strong> {userData.sleepTime}</p>
          <p><strong>Smoking/Drinking:</strong> {userData.smokeDrinkWeed}</p>
          <p><strong>Personality:</strong> {userData.extroversion}</p>
          
          <button onClick={() => setIsFlipped(true)} className="flip-btn small-btn">
            More Info 🔄
          </button>
          <button onClick={() => navigate("/questionnaire")} className="edit-btn">
            Edit Info ✏️
          </button>
        </div>

        {/* Back Side */}
        <div className="profile-back">
          <h2>More Info</h2>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Activity Level:</strong> {userData.activityLevel}</p>
          <p><strong>Cleanliness:</strong> {userData.cleanliness}</p>
          <p><strong>Dietary Restrictions:</strong> {userData.dietaryRestrictions}</p>
          <p><strong>Earliest Class Time:</strong> {userData.earliestClassTime}</p>
          <p><strong>Extroversion:</strong> {userData.extroversion}</p>
          <p><strong>Friendship Preference:</strong> {userData.friendshipPreference}</p>
          <p><strong>Graduation Year:</strong> {userData.graduationYear}</p>
          <p><strong>Guests Throughout Day:</strong> {userData.guestsThroughoutDay}</p>
          <p><strong>Hobbies:</strong> {userData.hobbies}</p>
          <p><strong>Music Preference:</strong> {userData.musicPreference}</p>
          <p><strong>Overnight Stay:</strong> {userData.overnightStay}</p>
          <p><strong>People Over:</strong> {userData.peopleOver}</p>
          <p><strong>Preferred Study Location:</strong> {userData.preferredStudyLocation}</p>
          <p><strong>Room Decorations:</strong> {userData.roomDecorations}</p>
          <p><strong>Room Type:</strong> {userData.roomType}</p>
          <p><strong>Share Cleaning Supplies:</strong> {userData.shareCleaningSupplies}</p>
          <p><strong>Sleep Time:</strong> {userData.sleepTime}</p>
          <p><strong>Smoking/Drinking:</strong> {userData.smokeDrinkWeed}</p>
          <p><strong>Study Preference:</strong> {userData.studyPreference}</p>
          
          <button onClick={() => setIsFlipped(false)} className="flip-btn small-btn">
            Back 🔄
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
        <button onClick={() => navigate("/policy")} className="sidebar-btn">
          Policy Page
        </button>
        <button onClick={handleLogout} className="sidebar-btn logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
