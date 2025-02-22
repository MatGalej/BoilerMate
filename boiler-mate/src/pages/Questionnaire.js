import React, { useState, useEffect } from "react";
import { firestore, auth } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
//import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import ProfilePictureUpload from "../services/profilePictureUpload"; // ✅ Import profile picture upload component

const Questionnaire = () => {
  //const location = useLocation();
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [userID, setUserID] = useState(null); // ✅ Store authenticated user ID

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    major: "",
    graduationYear: "",
    roomType: "",
    hobbies: "",
    cleanliness: 4,
    earliestClassTime: "",
    preferredStudyLocation: "",
    extroversion: 4,
    friendshipPreference: 4,
    musicPreference: "",
    dietaryRestrictions: "",
    overnightStay: "",
    guestsThroughoutDay: 4,
    sharedCleaningSupplies: "",
    sleepTime: "",
    smokeDrinkWeed: "",
    activityLevel: 4,
  });

  // ✅ Fetch authenticated user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserID(user.uid); // ✅ Set the correct user ID from Firebase Auth
      } else {
        navigate("/login"); // Redirect if not logged in
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);

  if (!userID) return <p>Loading...</p>; // Prevent blank screen if userID is missing

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSubmit = async () => {
    try {
      await setDoc(doc(firestore, "users", userID), formData, { merge: true });
      alert("Profile saved!");
      navigate("/home"); // ✅ Redirect to home after completion
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="flex flex-col items-center bg-gray-800 text-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-3xl font-bold mb-4 italic">
        Profile
        <div className="h-1 w-24 bg-yellow-500 mt-2"></div>
      </h2>

      {/* Step 1: First Name & Last Name */}
      {step === 1 && (
        <>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          />
          {!formData.firstName.trim() && <p className="text-red-500">First Name is required</p>}
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          />
          {!formData.lastName.trim() && <p className="text-red-500">Last Name is required</p>}

          <button
            onClick={nextStep}
            disabled={!formData.firstName.trim() || !formData.lastName.trim()} // Disable if empty
            className={`p-2 rounded w-full mt-2 ${
              !formData.firstName.trim() || !formData.lastName.trim()
                ? "bg-gray-400 cursor-not-allowed" // Disabled style
                : "bg-yellow-500 text-black" // Enabled style
            }`}
          >
            Next
          </button>
        </>
      )}

      {/* Step 2: Major & Graduation Year */}
      {step === 2 && (
        <>
          <input
            type="text"
            name="major"
            placeholder="Major"
            value={formData.major}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          />
          <select
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          >
            <option value="">Select Graduation Year</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
          </select>
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 3: Room Type */}
      {step === 3 && (
        <>
          <select
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          >
            <option value="">Select Room Type</option>
            <option value="Double">Double</option>
            <option value="Triple">Triple</option>
            <option value="Quad">Quad</option>
            <option value="Apartment/Suite">Apartment/Suite</option>
          </select>
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 4: Hobbies */}
      {step === 4 && (
        <>
          <textarea
            name="hobbies"
            placeholder="List your hobbies"
            value={formData.hobbies}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white h-24"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 5: Cleanliness */}
      {step === 5 && (
        <>
          <label className="text-center mb-2">
            Rate your cleanliness (1-7)
          </label>
          <label className="text-center mb-2">
            How clean do you keep your space? (1 = messy, 7 = very clean)
            <span className="ml-2 font-bold text-yellow-500">
              {formData.cleanliness}
            </span>
          </label>

          <input
            type="range"
            name="cleanliness"
            min="1"
            max="7"
            value={formData.cleanliness}
            onChange={handleSliderChange}
            className="w-full my-2"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 6: Earliest Class Time */}
      {step === 6 && (
        <>
          <select
            name="earliestClassTime"
            value={formData.earliestClassTime}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          >
            <option value="">Select Earliest Class Time</option>
            <option value="Before 8 AM">Before 8 AM</option>
            <option value="8-10 AM">8-10 AM</option>
            <option value="10 AM - 12 PM">10 AM - 12 PM</option>
          </select>
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 7: Preferred Study Location (Short Answer) */}
      {step === 7 && (
        <>
          <label className="text-center mb-2">
            Where do you prefer to study?
          </label>
          <input
            type="text"
            name="preferredStudyLocation"
            placeholder="Library, dorm, café..."
            value={formData.preferredStudyLocation}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 8: Extroversion (1-7 Slider) */}
      {step === 8 && (
        <>
          <label className="text-center mb-2">
            How extroverted are you? (1 = introvert, 7 = extrovert)
          </label>
          <label className="text-center mb-2">
            How extroverted are you? (1 = introvert, 7 = extrovert)
            <span className="ml-2 font-bold text-yellow-500">
              {formData.extroversion}
            </span>
          </label>

          <input
            type="range"
            name="extroversion"
            min="1"
            max="7"
            value={formData.extroversion}
            onChange={handleSliderChange}
            className="w-full my-2"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 9: Friendship Preference (1-7 Slider) */}
      {step === 9 && (
        <>
          <label className="text-center mb-2">
            How social do you want to be with your roommate? (1 = distant, 7 =
            best friends)
          </label>
          <label className="text-center mb-2">
            How close do you want to be with your roommate? (1 = distant, 7 =
            best friends)
            <span className="ml-2 font-bold text-yellow-500">
              {formData.friendshipPreference}
            </span>
          </label>

          <input
            type="range"
            name="friendshipPreference"
            min="1"
            max="7"
            value={formData.friendshipPreference}
            onChange={handleSliderChange}
            className="w-full my-2"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 10: Music Preference (Short Answer) */}
      {step === 10 && (
        <>
          <label className="text-center mb-2">
            What are your music preferences? (Speakers, instrument usage, etc.)
          </label>
          <textarea
            name="musicPreference"
            placeholder="Headphones only, speakers okay, plays guitar..."
            value={formData.musicPreference}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white h-24"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 11: Dietary Restrictions (Short Answer) */}
      {step === 11 && (
        <>
          <label className="text-center mb-2">
            Do you have any dietary restrictions or allergies?
          </label>
          <textarea
            name="dietaryRestrictions"
            placeholder="Vegetarian, peanut allergy, etc."
            value={formData.dietaryRestrictions}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white h-24"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 12: Guests Overnight Stay (Dropdown) */}
      {step === 12 && (
        <>
          <label className="text-center mb-2">
            Are you comfortable with overnight guests?
          </label>
          <select
            name="overnightStay"
            value={formData.overnightStay}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 13: Guests Throughout Day (1-7 Slider) */}
      {step === 13 && (
        <>
          <label className="text-center mb-2">
            How often do you have guests over during the day? (1 = never, 7 =
            very often)
          </label>
          <input
            type="range"
            name="guestsThroughoutDay"
            min="1"
            max="7"
            value={formData.guestsThroughoutDay}
            onChange={handleSliderChange}
            className="w-full my-2"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 14: Shared Cleaning Supplies (Yes/No Dropdown) */}
      {step === 14 && (
        <>
          <label className="text-center mb-2">
            Would you be okay with sharing cleaning supplies?
          </label>
          <select
            name="sharedCleaningSupplies"
            value={formData.sharedCleaningSupplies}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 15: Sleep Time (Time Select) */}
      {step === 15 && (
        <>
          <label className="text-center mb-2">
            What time do you usually go to bed?
          </label>
          <input
            type="time"
            name="sleepTime"
            value={formData.sleepTime}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 16: Smoke, Drink, Weed (Checkbox Input) */}
      {step === 16 && (
        <>
          <label className="text-center mb-2">
            Do you smoke, drink, or use weed? (Select all that apply)
          </label>

          <div className="flex flex-col space-y-2">
            {["Smoke", "Drink", "Weed", "None"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="smokeDrinkWeed"
                  value={option}
                  checked={formData.smokeDrinkWeed.includes(option)}
                  onChange={(e) => {
                    const { value, checked } = e.target;
                    setFormData((prev) => ({
                      ...prev,
                      smokeDrinkWeed: checked
                        ? [...prev.smokeDrinkWeed, value] // Add option if checked
                        : prev.smokeDrinkWeed.filter((item) => item !== value), // Remove if unchecked
                    }));
                  }}
                  className="h-5 w-5 text-yellow-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 17: Activity Level (1-7 Slider) */}
      {step === 17 && (
        <>
          <label className="text-center mb-2">
            How active are you? (1 = sedentary, 7 = very active)
          </label>
          <input
            type="range"
            name="activityLevel"
            min="1"
            max="7"
            value={formData.activityLevel}
            onChange={handleSliderChange}
            className="w-full my-2"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 18: Profile Picture Upload */}
      {step === 18 && (
        <>
          <ProfilePictureUpload userID={userID} />
          <button
            onClick={handleSubmit}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Submit
          </button>
        </>
      )}

      {/* Navigation Buttons */}
      {step > 1 && (
        <button
          onClick={prevStep}
          className="bg-gray-600 text-white p-2 rounded w-full mt-2"
        >
          Back
        </button>
      )}
    </div>
  );
};

export default Questionnaire;
