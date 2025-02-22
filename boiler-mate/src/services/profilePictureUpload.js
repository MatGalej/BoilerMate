import React, { useState } from "react";
import { storage, firestore } from "../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

const ProfilePictureUpload = ({ userID }) => {
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profilePicURL, setProfilePicURL] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image first!");

    // ✅ Fixed template literal syntax
    const storageRef = ref(storage, `profile_pictures/${userID}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
      },
      async () => {
        // ✅ Get Download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setProfilePicURL(downloadURL);
        setLoading(false);

        // ✅ Update Firestore with profile picture URL
        await updateDoc(doc(firestore, "users", userID), {
          profilePic: downloadURL,
        });

        alert("Profile picture updated successfully!");
      }
    );
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 text-white p-4 rounded-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Upload Profile Picture</h2>

      {/* Display Image Preview */}
      {profilePicURL && (
        <img
          src={profilePicURL}
          alt="Profile"
          className="w-32 h-32 rounded-full mb-3"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-3"
      />

      {uploadProgress > 0 && (
        <p className="text-yellow-500">
          Uploading: {Math.round(uploadProgress)}%
        </p>
      )}

      <button
        onClick={handleUpload}
        className="bg-yellow-500 text-black p-2 rounded w-full"
      >
        Upload
      </button>
    </div>
  );
};

export default ProfilePictureUpload;
