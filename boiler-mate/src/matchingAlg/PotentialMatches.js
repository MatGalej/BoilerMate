import React, { useState, useEffect } from "react";
import TinderCard from "react-tinder-card";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { findBestMatch } from "./procedural"; // Or wherever your matching logic is
import "../css/PotentialMatches.css"; // Import the CSS file

function PotentialMatches({ userId }) {
  const [matches, setMatches] = useState([]);
  const [flashColor, setFlashColor] = useState(""); // Controls screen flash color

  // Fetch matches from your custom matching logic + Firestore
  useEffect(() => {
    const fetchMatches = async () => {
      if (!userId) return;

      try {
        // This function should return an array of user IDs
        const matchIds = await findBestMatch(userId);
        if (!matchIds || matchIds.length === 0) return;

        const fetchedProfiles = [];

        for (const matchId of matchIds) {
          const userSnap = await getDoc(doc(db, "users", matchId));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            fetchedProfiles.push({
              uid: matchId,
              name: `${userData.firstName} ${userData.lastName}`,
              major: userData.major,
              graduationYear: userData.graduationYear,
              profilePic: userData.profilePic
                ? `data:image/jpeg;base64,${userData.profilePic}`
                : "https://via.placeholder.com/400x500", // Fallback image
            });
          }
        }

        setMatches(fetchedProfiles);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchMatches();
  }, [userId]);

  // Called when a card is swiped
  const swiped = async (direction, match) => {
    if (!userId || !match || !match.uid) return; // Ensure valid user and match data

    console.log(`Swiped ${direction} on ${match.name}`);

    const userRef = doc(db, "users", userId);

    try {
      if (direction === "right") {
        // ✅ Add match to "friends" list
        await updateDoc(userRef, {
          friends: arrayUnion(match.uid),
        });
        console.log(`${match.name} added to friends`);
        setFlashColor("green-flash"); // Green for accepted
        setTimeout(() => setFlashColor(""), 300); // Remove flash effect after 300ms
      } else if (direction === "left") {
        // ✅ Add match to "denied" list
        await updateDoc(userRef, {
          deniedUsers: arrayUnion(match.uid),
        });
        console.log(`${match.name} added to denied`);
        setFlashColor("red-flash"); // Green for accepted
        setTimeout(() => setFlashColor(""), 300); // Remove flash effect after 300ms
      }
    } catch (error) {
      console.error("Error updating lists:", error);
    }
  };

  // Called when a card leaves the screen
  const outOfFrame = async (match, direction) => {
    if (!userId || !match || !match.uid) return;

    console.log(`${match.name} left the screen on the ${direction} side.`);

    const userRef = doc(db, "users", userId);

    try {
      if (direction === "right") {
        await updateDoc(userRef, {
          friends: arrayUnion(match.uid),
        });
        console.log(`${match.name} automatically added to friends.`);
        setFlashColor("green-flash"); // Green for accepted
        setTimeout(() => setFlashColor(""), 300); // Remove flash effect after 300ms
      } else if (direction === "left") {
        await updateDoc(userRef, {
          deniedUsers: arrayUnion(match.uid),
        });
        console.log(`${match.name} automatically added to denied.`);
        setFlashColor("red-flash"); // Green for accepted
        setTimeout(() => setFlashColor(""), 300); // Remove flash effect after 300ms
      }
    } catch (error) {
      console.error("Error updating lists:", error);
    }
  };

  return (
    <div className={`matches-container ${flashColor}`}>
      <h2 className="title">Potential Matches</h2>

      <div className="card-container">
        {matches.length > 0 ? (
          matches.map((match) => (
            <TinderCard
              className="swipe"
              key={match.uid}
              onSwipe={(dir) => swiped(dir, match)} // ✅ Track swipe direction
              onCardLeftScreen={() => outOfFrame(match)} // ✅ Auto-classify on exit
              preventSwipe={["up", "down"]} // Only allow left/right swipes
            >
              <div
                className="card"
                style={{ backgroundImage: `url(${match.profilePic})` }}
              >
                <div className="card-info">
                  <h3>{match.name}</h3>
                  <p>
                    {match.major} • {match.graduationYear}
                  </p>
                </div>
              </div>
            </TinderCard>
          ))
        ) : (
          <p className="no-matches">No potential matches found.</p>
        )}
      </div>
    </div>
  );
}

export default PotentialMatches;
