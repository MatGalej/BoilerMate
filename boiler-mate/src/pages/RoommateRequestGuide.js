import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import "../css/request.css";

const RoommateRequestGuide = () => {
  const navigate = useNavigate();

  useEffect(() => {
          const checkUserLoggedIn = () => {
                if (!auth.currentUser) {
                  navigate("/");
                }
              };
          checkUserLoggedIn();
  }, []);

  return (
    <div className="welcome-background">
      <div className="guide-container">
        {/* Header */}
        <h2>Roommate Request Guide</h2>

        <p className="guide-text">
          Follow these steps to successfully request a roommate through Purdue's
          Housing Portal.
        </p>

        {/* Steps List */}
        <ul className="guide-text">
          <li>
            <strong>Verify the Purdue Alias:</strong> Ensure you have your
            roommate's <b>Purdue alias</b> (before "@purdue.edu").
          </li>
          <li>
            <strong>Search Alternatives:</strong> Try searching by{" "}
            <b>Full Name</b> or <b>Student Number</b>.
          </li>
          <li>
            <strong>Enable Roommate Matching:</strong> Ask your roommate to{" "}
            <b>enable their profile</b> in the Housing system.
          </li>
          <li>
            <strong>Use the Matching Survey:</strong> If you don’t have a
            roommate, complete the <b>housing preference survey</b>.
          </li>
          <li>
            <strong>Confirm & Assign:</strong> Once accepted, you{" "}
            <b>must assign</b> them to your selected room.
          </li>
        </ul>

        {/* Contact Section */}
        <div className="contact-section">
          <h3>Need Help?</h3>
          <p>
            📞 Call: <a href="tel:7654941000">(765) 494-1000</a>
          </p>
          <p>
            🌐 Visit:{" "}
            <a
              href="https://housing.purdue.edu"
              target="_blank"
              rel="noopener noreferrer"
            >
              Purdue Housing Portal
            </a>
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="cta-buttons">
          <a
            href="https://purdue.starrezhousing.com/StarRezPortalX/DB36B528/1/1/Home-Home?UrlToken=AC026A12"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="cta-button">🚀 Go to Housing Portal</button>
          </a>
          <a href="mailto:housing@purdue.edu">
            <button className="cta-button">✉️ Email Purdue Housing</button>
          </a>
          <button onClick={() => navigate("/home")} className="back-button">
            🔙 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoommateRequestGuide;
