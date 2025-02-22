import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoommateRequestGuide = () => {
  const navigate = useNavigate(); // ✅ Replace useHistory with useNavigate

  const handleBackClick = () => {
    navigate('/'); // ✅ Updated for React Router v6
  };

  return (
    <div className="flex flex-col md:flex-row items-center bg-gray-100 p-8 rounded-lg shadow-lg max-w-5xl mx-auto">
      {/* Content Section */}
      <div className="md:w-2/3 p-6 bg-white rounded-lg shadow-md border border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Roommate Request Guide</h2>

        <p className="text-gray-700 mb-4 text-sm text-center">
          Follow these steps to successfully request a roommate through Purdue's Housing Portal.
        </p>

        <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm">
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
        </ol>

        {/* Contact Information */}
        <div className="mt-4">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Need Help?</h3>
          <ul className="list-disc pl-4 text-gray-600 text-sm">
            <li>📞 Call: <a href="tel:7654941000" className="text-blue-600 font-medium">(765) 494-1000</a></li>
            <li>🌐 Visit: <a href="https://housing.purdue.edu" className="text-blue-600 font-medium" target="_blank" rel="noopener noreferrer">Purdue Housing Portal</a></li>
          </ul>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="mt-6 flex flex-col gap-4">
          <a href="https://purdue.starrezhousing.com/StarRezPortalX/DB36B528/1/1/Home-Home?UrlToken=AC026A12" target="_blank" rel="noopener noreferrer">
            <button className="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 shadow-md text-sm">
              🚀 Go to Housing Portal
            </button>
          </a>
          <a href="mailto:housing@purdue.edu">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-md text-sm">
              ✉️ Email Purdue Housing
            </button>
          </a>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 shadow-md text-sm"
          >
            🔙 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoommateRequestGuide;
