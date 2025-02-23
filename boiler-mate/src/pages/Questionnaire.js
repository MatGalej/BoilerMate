import React, { useRef, useState, useEffect } from "react";
import { firestore, auth } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
//import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import ProfilePictureUpload from "../services/profilePictureUpload"; // ✅ Import profile picture upload component
import "../css/Questionnaire.css";

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
    cleanliness: "",
    earliestClassTime: "",
    preferredStudyLocation: "",
    extroversion: "",
    friendshipPreference: "",
    musicPreference: "",
    dietaryRestrictions: "",
    overnightStay: "",
    guestsThroughoutDay: 4,
    sharedCleaningSupplies: "",
    roomDecorations: "",
    sleepTime: "",
    smokeDrinkWeed: "",
    activityLevel: "",
  });
  const totalFields = Object.keys(formData).length; // Total number of fields
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

  // Calculate the number of fields completed
  const completedFields = Object.values(formData).filter((value) =>
    typeof value === "string"
      ? value.trim() !== ""
      : value !== null && value !== ""
  ).length;

  const progressPercentage = (completedFields / totalFields) * 100; // Completion percentage

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

  const getIsNextDisabled = () => {
    switch (step) {
      case 1:
        return !formData.firstName.trim() || !formData.lastName.trim();

      case 2:
        return !formData.major.trim() || !formData.graduationYear.trim();

      case 3:
        return !formData.roomType.trim();

      case 4:
        return !formData.hobbies.trim();

      case 5:
        return formData.cleanliness === ""; // Ensure cleanliness is selected

      case 6:
        return !formData.earliestClassTime.trim();

      case 7:
        return !formData.preferredStudyLocation.trim();

      case 8:
        return formData.extroversion === ""; // Ensure extroversion is selected

      case 9:
        return formData.friendshipPreference === ""; // Ensure friendship preference is selected

      case 10:
        return !formData.musicPreference.trim();

      case 11:
        return !formData.dietaryRestrictions.trim();

      case 12:
        return !formData.overnightStay.trim();

      case 13:
        return formData.guestsThroughoutDay === ""; // Ensure guests throughout the day is selected

      case 14:
        return !formData.sharedCleaningSupplies.trim();

      case 15:
        return !formData.sleepTime.trim();

      case 16:
        return formData.smokeDrinkWeed.length === 0; // Ensure at least one checkbox is selected

      case 17:
        return formData.activityLevel === ""; // Ensure activity level is selected

      case 18:
        return !formData.roomDecorations.trim(); // Ensure room decorations preference is entered

      case 19:
        return false; // Profile picture upload step, no validation needed

      default:
        return false;
    }
  };

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-container">
        <div className="progress-wrapper">
          {/* Profile Title */}
          <h2 className="profile-title">Profile</h2>

          {/* Progress Bar (now auto-sized by CSS) */}
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: First Name & Last Name */}
        {step === 1 && (
          <>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
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
          </>
        )}

        {/* Step 3: Room Type */}
        {step === 3 && (
          <>
            <select
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              className="p-2 mb-3 rounded bg-gray-600 text-white"
            >
              <option value="">Select Room Type</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
              <option value="Quad">Quad</option>
              <option value="Apartment/Suite">Apartment/Suite</option>
            </select>
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
            />
          </>
        )}

        {/* Step 5: Cleanliness */}
        {step === 5 && (
          <div className="slider-container">
            <label className="questionText">
              How clean do you keep your space?
            </label>

            <div className="slider-wrapper">
              <span className="slider-value">{formData.cleanliness}</span>
              <input
                type="range"
                name="cleanliness"
                min="1"
                max="7"
                value={formData.cleanliness}
                onChange={handleSliderChange}
                className="custom-slider"
              />
            </div>
          </div>
        )}

        {/* Step 6: Earliest Class Time */}
        {step === 6 && (
          <>
            <select
              name="earliestClassTime"
              value={formData.earliestClassTime}
              onChange={handleChange}
            >
              <option value="">Select Earliest Class Time</option>
              <option value="Before 8 AM">Before 8 AM</option>
              <option value="8-10 AM">8-10 AM</option>
              <option value="10 AM - 12 PM">10 AM - 12 PM</option>
            </select>
          </>
        )}

        {/* Step 7: Preferred Study Location (Short Answer) */}
        {step === 7 && (
          <div className="input-group">
            <label htmlFor="preferredStudyLocation" class="questionText">
              Where do you prefer to study?
            </label>
            <input
              type="text"
              name="preferredStudyLocation"
              placeholder="Library, dorm, café..."
              value={formData.preferredStudyLocation}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Step 8: Extroversion (1-7 Slider) */}
        {step === 8 && (
          <div className="slider-container">
            <label className="questionText">
              How extroverted are you? (1 = introvert, 7 = extrovert)
            </label>

            <div className="slider-wrapper">
              <span className="slider-value">{formData.extroversion}</span>
              <input
                type="range"
                name="extroversion"
                min="1"
                max="7"
                value={formData.extroversion}
                onChange={handleSliderChange}
                className="custom-slider"
              />
            </div>
          </div>
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
          </>
        )}

        {/* Step 13: Guests Throughout Day (1-7 Slider) */}
        {step === 13 && (
          <>
            <label className="text-center mb-2">
              How comfortable with you having guests over? (1 = never, 7 = very
              often)
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
          </>
        )}

        {/* Step 18: Room decorations */}
        {step === 18 && (
          <>
            <label className="text-center mb-2">
              Do you care about room decorations?
            </label>
            <input
              type="text"
              name="roomDecorations"
              placeholder="Aesthetic, minimal, etc."
              value={formData.roomDecorations}
              onChange={handleChange}
              className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
            />
          </>
        )}

        {/* Step 19: Profile Picture Upload */}
        {step === 19 && (
          <>
            <ProfilePictureUpload userID={userID} />
          </>
        )}

        {/* Button Group (Ensures Back and Next are side by side) */}
        <div className="button-group">
          {/* Back button (only show if step > 1) */}
          {step > 1 && (
            <button onClick={prevStep} className="button back-button">
              Back
            </button>
          )}

          {/* Next/Submit button (conditionally disabled) */}
          <button
            onClick={step === 19 ? handleSubmit : nextStep}
            disabled={getIsNextDisabled()} // Calls function to check if button should be disabled
            className={`button ${getIsNextDisabled() ? "disabled" : "enabled"}`}
          >
            {step === 19 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
