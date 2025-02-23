import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // Import Firebase instance
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { findBestMatch } from "./procedural";
import TinderCard from "react-tinder-card";

function PotentialMatches({ userId }) {
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const addUserProfiles = (newUserProfiles) => {
    setPotentialMatches((prevUserProfiles) => [...prevUserProfiles, newUserProfiles]);
  };

  useEffect(() => {
    const fetchPotentialMatches = async () => {
      if (!userId) return;

      try {
        const userSnap = await getDoc(doc(db, "users", userId));

        if (userSnap.exists()) {
          setPotentialMatches(await findBestMatch(userId));

          if (potentialMatches.length > 0) {
            for (const matchId of potentialMatches) {
              console.log(matchId);
              const matchSnap = await getDoc(doc(db, "users", matchId));
              const matchData = matchSnap.data();
              let dict = {};
              dict["uid"] = matchId;
              if (matchData.profilePic) {
                dict["profilePicture"] = `data:image/jpeg;base64,${matchData.profilePic}`;
                console.log(dict["profilePicture"]);
              }
              dict["name"] = matchData.firstName + " " + matchData.lastName;
              addUserProfiles(dict);
            }
            console.log(userProfiles);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    };

    fetchPotentialMatches(userId);
  }, [userId]);

  const onSwipe = async (direction, matchId) => {
    console.log(`You swiped ${direction} on ${matchId}`);

    if (direction === "right") {
      try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          likedMatches: potentialMatches.filter((id) => id !== matchId), // Add logic to update likes
        });

        console.log("✅ Liked Match Updated in Firestore");
      } catch (error) {
        console.error("❌ Error updating liked match:", error);
      }
    }

    // Remove swiped card from UI
    setPotentialMatches((prevMatches) => prevMatches.filter((id) => id !== matchId));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">Potential Matches</h1>

      <div className="w-96 h-96 relative">
        {userProfiles.length > 0 ? (
          userProfiles.map((matches) => {
            return (
              <TinderCard
                key={matches.uid}
                className="absolute w-full h-full bg-white rounded-lg shadow-lg flex items-center justify-center"
                onSwipe={(dir) => onSwipe(dir, matches.uid)}
                preventSwipe={["up", "down"]}
              >
                <div className="p-4 text-center">
                  {matches.profilePicture ? (
                    <img 
                    src={matches.profilePicture || "https://via.placeholder.com/150"} 
                    alt=""
                    className="profile-pic"
                  />
                  ) : (
                    <p className="text-black">No Image</p>
                  )}
                  <h2 className="text-black font-semibold text-lg mt-2">{matches.name || "Unknown User"}</h2>
                  <p className="text-gray-600">Swipe Left or Right</p>
                </div>
              </TinderCard>
            );
          })
        ) : (
          <p>No more potential matches.</p>
        )}
      </div>
    </div>
  );
}


export default PotentialMatches;