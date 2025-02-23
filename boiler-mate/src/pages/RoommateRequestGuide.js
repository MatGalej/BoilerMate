import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/request.css';

const RoommateRequestGuide = () => {
  const navigate = useNavigate(); // ✅ Replace useHistory with useNavigate

  const handleBackClick = () => {
    navigate('/'); // ✅ Updated for React Router v6
  };

  return (
    <div className="welcome-background">
      {/* Content Section */}
      <div className="">
        <h2 className="">Roommate Request Guide</h2>

        <p className="guide-text">
          Follow these steps to successfully request a roommate through Purdue's Housing Portal.
        </p>

        <ul className="guide-text">
          <li>
            <strong>Verify the Purdue Alias:</strong> Ensure you have your roommate's <b>Purdue alias</b> (the part before "@purdue.edu").
          </li>
          <li>
            <strong>Search Alternatives:</strong> If the alias search fails, try searching by <b>Full Name</b> or <b>Student Number</b>.
          </li>
          <li>
            <strong>Enable Roommate Matching:</strong> Ask your roommate to <b>enable their profile</b> in the Housing system.
          </li>
          <li>
            <strong>Use the Matching Survey:</strong> If you don't have a specific roommate, fill out the <b>housing preference survey</b>.
          </li>
          <li>
            <strong>Confirm & Assign Roommate:</strong> Once accepted, you <b>must assign them</b> to your selected room in the portal.
          </li>
        </ul>

        {/* Contact Information */}
        <div className="guide-text">
          <h3 className="">Need Help?</h3>
          <ul className="">
            <li>📞 Call: <a href="tel:7654941000" className="text-blue-600 font-medium">(765) 494-1000</a></li>
            <li>🌐 Visit: <a href="https://housing.purdue.edu" className="text-blue-600 font-medium" target="_blank" rel="noopener noreferrer">Purdue Housing Portal</a></li>
          </ul>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="guide-text">
          <a href="https://purdue.starrezhousing.com/StarRezPortalX/DB36B528/1/1/Home-Home?UrlToken=AC026A12" target="_blank" rel="noopener noreferrer">
            <button className="">
              🚀 Go to Housing Portal
            </button>
          </a>
          <a href="mailto:housing@purdue.edu">
            <button className="">
              ✉️ Email Purdue Housing
            </button>
          </a>
        </div>

        {/* Back Button */}
        <div className="">
          <button
            onClick={() => navigate("/home")}
            className=""
          >
            🔙 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoommateRequestGuide;
