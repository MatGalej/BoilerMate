import React, { useState, useEffect } from "react";
import { firestore, auth } from "../firebaseConfig"; // ✅ Import auth
import { doc, updateDoc, getDoc } from "firebase/firestore";

const ProfilePictureUpload = () => {
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profilePicURL, setProfilePicURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  // ✅ Check if user is authenticated
  const userID = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    const fetchUserData = async () => {
      if (userID) {
        const userDoc = await getDoc(doc(firestore, "users", userID));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const base64String = data.profilePic;
          setProfilePicURL(`data:image/jpeg;base64,${base64String}`);
          setUserName(`${data.firstName} ${data.lastName}`);
        }
      }
    };

    fetchUserData();
  }, [userID]);

  if (!userID) {
    return <p className="text-red-500">You must be logged in to upload a profile picture.</p>;
  }

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicURL(reader.result); // Show preview before uploading
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle Upload
  const handleUpload = async () => {
    if (!image) return alert("Please select an image first!");
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1];

        // ✅ Update Firestore with new profile picture Base64 string
        await updateDoc(doc(firestore, "users", userID), {
          profilePic: base64String,
        });

        alert("Profile picture updated successfully!");
        setLoading(false);
      };
      reader.readAsDataURL(image);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 text-white p-4 rounded-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Upload Profile Picture</h2>

      {/* ✅ Show User Name */}
      <p className="text-lg mb-4">{userName}</p>

      {/* ✅ Show Image Preview */}
      {profilePicURL ? (
        <img
          src={profilePicURL}
          alt="Profile Preview"
          className="w-32 h-32 rounded-full mb-3 border-2 border-yellow-500"
        />
      ) : (
        <p className="text-gray-400">No image selected</p>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-3"
      />

      {/* ✅ Show Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <p className="text-yellow-500">Uploading: {Math.round(uploadProgress)}%</p>
      )}

      <button
        onClick={handleUpload}
        className="bg-yellow-500 text-black p-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {/* Additional Buttons */}
      <div className="mt-4 w-full flex flex-col gap-2">
        <button className="bg-blue-500 text-white p-2 rounded w-full">
          Change Password
        </button>
        <button className="bg-green-500 text-white p-2 rounded w-full">
          Change Username
        </button>
        <button className="bg-gray-500 text-white p-2 rounded w-full">
          Edit Profile
        </button>
        <button className="bg-red-500 text-white p-2 rounded w-full mt-4">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;