import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { findBestMatch } from "./procedural";

function PotentialMatches({ userId }) {
  const [potentialMatches, setPotentialMatches] = useState([]);
  let userProfiles = [];

  useEffect(() => {
    const fetchPotentialMatches = async () => {
      if (!userId) return;

      try {
        const userSnap = await getDoc(doc(db, "users", userId));

        if (userSnap.exists()) {
          setPotentialMatches( await findBestMatch(userId) || []);
          console.log(potentialMatches);
          if (potentialMatches.length > 0) {
            for (let i = 0; i < potentialMatches.length; i++) {
              console.log(potentialMatches[i]);
              const userSnap = await getDoc(doc(db, "users", potentialMatches[i]));
              const userData = userSnap.data();
              let temp_dict = {};
              temp_dict["uid"] = potentialMatches[i];
              temp_dict["name"] = userData.firstName + " " + userData.lastName;
              temp_dict["profilePic"] = `data:image/jpeg;base64,${userData.profilePic}`;
              userProfiles.push(temp_dict);
            }
        }
        console.log(userProfiles);
        }
      } catch (err) {
        console.error(err);
      } 
    };

    fetchPotentialMatches();
  }, [userId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Potential Matches</h2>

      <ul className="list-disc pl-5">
        {potentialMatches.length > 0 ? (
          potentialMatches.map((matchId, index) => (
            <li key={index} className="text-gray-800">{matchId}</li>
          ))
        ) : (
          <p>No potential matches found.</p>
        )}
      </ul>
    </div>
  );
}

export default PotentialMatches;