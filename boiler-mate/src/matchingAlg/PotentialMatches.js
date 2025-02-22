import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // Import Firebase instance
import { doc, getDoc } from "firebase/firestore";
import { findBestMatch } from "./procedural";

function PotentialMatches({ userId }) {
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPotentialMatches = async () => {
      if (!userId) {
        setError("No user ID provided.");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setPotentialMatches(findBestMatch(userId));
        } else {
          setError("User not found.");
        }
      } catch (err) {
        setError("Error fetching potential matches.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPotentialMatches(userId);
  }, [userId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Potential Matches</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <ul className="list-disc pl-5">
          {potentialMatches.length > 0 ? (
            potentialMatches.map((matchId, index) => (
              <li key={index} className="text-gray-800">{matchId}</li>
            ))
          ) : (
            <p>No potential matches found.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default PotentialMatches;