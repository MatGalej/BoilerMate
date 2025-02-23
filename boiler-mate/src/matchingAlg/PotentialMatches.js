import React, { useState, useEffect } from "react";
import TinderCard from "react-tinder-card";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { findBestMatch } from "./procedural";
import "../css/PotentialMatches.css";
import { useNavigate } from "react-router-dom";

function PotentialMatches({ userId }) {
  const [matches, setMatches] = useState([]);
  const [flashColor, setFlashColor] = useState("");
  const [flippedCards, setFlippedCards] = useState({});
  const navigate = useNavigate();

  // Listen for Escape key to exit
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        navigate("/home");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      if (!userId) return;

      try {
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
              hobbies: userData.hobbies || "Not specified",
              cleanliness: userData.cleanliness || "Not specified",
              sleepTime: userData.sleepTime || "Not specified",
              profilePic: userData.profilePic
                ? `data:image/jpeg;base64,${userData.profilePic}`
                : "https://via.placeholder.com/400x500",
            });
          }
        }

        setMatches(fetchedProfiles);

        const initialFlippedState = fetchedProfiles.reduce((acc, match) => {
          acc[match.uid] = false;
          return acc;
        }, {});
        setFlippedCards(initialFlippedState);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchMatches();
  }, [userId]);

  // Swipe logic
  const swiped = async (direction, match) => {
    if (!userId || !match || !match.uid) return;

    console.log(`Swiped ${direction} on ${match.name}`);
    const userRef = doc(db, "users", userId);

    try {
      if (direction === "right") {
        await updateDoc(userRef, {
          friends: arrayUnion(match.uid),
        });
        console.log(`${match.name} added to friends`);
        setFlashColor("green-flash");
      } else if (direction === "left") {
        await updateDoc(userRef, {
          deniedUsers: arrayUnion(match.uid),
        });
        console.log(`${match.name} added to denied`);
        setFlashColor("red-flash");
      }

      // Remove flash effect
      setTimeout(() => setFlashColor(""), 300);
    } catch (error) {
      console.error("Error updating lists:", error);
    }
  };

  // Called when card leaves screen
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
        setFlashColor("green-flash");
      } else if (direction === "left") {
        await updateDoc(userRef, {
          deniedUsers: arrayUnion(match.uid),
        });
        console.log(`${match.name} automatically added to denied.`);
        setFlashColor("red-flash");
      }
      setTimeout(() => setFlashColor(""), 300);
    } catch (error) {
      console.error("Error updating lists:", error);
    }
  };

  // Toggle flip
  const toggleFlip = (uid) => {
    setFlippedCards((prevState) => ({
      ...prevState,
      [uid]: !prevState[uid],
    }));
  };

  return (
    <div className={`matches-container ${flashColor}`}>
      <span className="close-btn" onClick={() => navigate("/home")}>
        ✖
      </span>
      <h2 className="title">Suggested Roommates</h2>

      <img
        src="/leftArrow.png"
        alt="Left Arrow"
        className="swipe-arrow left-arrow"
      />
      <img
        src="/rightArrow.png"
        alt="Right Arrow"
        className="swipe-arrow right-arrow"
      />

      <div className="card-container">
        {matches.length > 0 ? (
          matches.map((match) => (
            <TinderCard
              className="swipe"
              key={match.uid}
              onSwipe={(dir) => swiped(dir, match)}
              onCardLeftScreen={(dir) => outOfFrame(match, dir)}
              preventSwipe={["up", "down"]}
            >
              {/* Front Side */}
              <div
                className={`flip-card ${
                  flippedCards[match.uid] ? "flipped" : ""
                }`}
                onClick={() => toggleFlip(match.uid)}
              >
                <div
                  className="flip-front"
                  style={{ backgroundImage: `url(${match.profilePic})` }}
                >
                  <div className="flip-info">
                    <h3>{match.name}</h3>
                    <p>
                      {match.major} • {match.graduationYear}
                    </p>
                  </div>
                </div>
                {/* Back Side */}
                <div className="flip-back">
                  <h3>{match.name}</h3>
                  <p>
                    <strong>Hobbies:</strong> {match.hobbies}
                  </p>
                  <p>
                    <strong>Cleanliness:</strong> {match.cleanliness}
                  </p>
                  <p>
                    <strong>Sleep Time:</strong> {match.sleepTime}
                  </p>
                  <p>
                    <strong>Extroversion:</strong>{" "}
                    {match.extroversion || "Not specified"}
                  </p>
                  <p>
                    <strong>Room Type:</strong>{" "}
                    {match.roomType || "Not specified"}
                  </p>
                  <p>
                    <strong>Activity Level:</strong>{" "}
                    {match.activityLevel || "Not specified"}
                  </p>
                </div>
              </div>
            </TinderCard>
          ))
        ) : (
          <p className="no-matches">Loading matches...</p>
        )}
      </div>
    </div>
  );
}

export default PotentialMatches;
