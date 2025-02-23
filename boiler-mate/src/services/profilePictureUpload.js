import React, { useState, useEffect } from "react";
import { firestore, auth } from "../firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import "../css/Questionnaire.css";

const ProfilePictureUpload = () => {
  const [profilePicURL, setProfilePicURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  const userID = auth.currentUser?.uid;

  useEffect(() => {
    if (!userID) return; // ✅ Prevent unnecessary calls

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, "users", userID));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfilePicURL(
            data.profilePic ? `data:image/jpeg;base64,${data.profilePic}` : null
          );
          setUserName(`${data.firstName} ${data.lastName}`);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userID]);

  if (!userID) {
    return (
      <p className="text-red-500">
        You must be logged in to upload a profile picture.
      </p>
    );
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be under 2MB.");
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];

      try {
        await updateDoc(doc(firestore, "users", userID), {
          profilePic: base64String,
        });
        setProfilePicURL(reader.result);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 text-white p-5 rounded-lg w-full max-w-md shadow-md">
      <h2 className="questionText">Profile Picture</h2>

      {/* Custom File Upload Button */}
      <label
        htmlFor="file-upload"
        className={`custom-file-upload ${loading ? "disabled" : ""}`}
        aria-label="Upload a profile picture"
      >
        {loading ? "Uploading..." : "Choose File"}
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden-file-input"
        disabled={loading}
      />
    </div>
  );
};

export default ProfilePictureUpload;
