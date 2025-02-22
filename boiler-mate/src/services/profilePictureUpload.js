import React, { useState } from "react";
import { storage, firestore, auth } from "../firebaseConfig"; // ✅ Import auth
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

const ProfilePictureUpload = () => {
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profilePicURL, setProfilePicURL] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Check if user is authenticated
  const userID = auth.currentUser ? auth.currentUser.uid : null;
  if (!userID) {
    return <p className="text-red-500">You must be logged in to upload a profile picture.</p>;
  }

  // ✅ Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setProfilePicURL(URL.createObjectURL(e.target.files[0])); // Show preview before uploading
    }
  };

  // ✅ Handle Upload
  const handleUpload = async () => {
    if (!image) return alert("Please select an image first!");
    setLoading(true);

    try {
      const storageRef = ref(storage, `profile_pictures/${userID}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          setLoading(false);
        },
        async () => {
          // ✅ Get the image URL after upload
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setProfilePicURL(downloadURL);
          setLoading(false);

          // ✅ Update Firestore with new profile picture URL
          await updateDoc(doc(firestore, "users", userID), {
            profilePic: downloadURL,
          });

          alert("Profile picture updated successfully!");
        }
      );
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 text-white p-4 rounded-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Upload Profile Picture</h2>

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
    </div>
  );
};

export default ProfilePictureUpload;
