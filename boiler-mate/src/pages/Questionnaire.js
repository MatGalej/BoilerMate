import React, { useState } from "react";
import { firestore, auth, storage } from "../firebaseConfig"; // ✅ Ensure correct file name
import { doc, setDoc } from "firebase/firestore";
import ProfilePictureUpload from "../services/profilePictureUpload";

const Questionnaire = ({ userID }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    major: "",
    graduationYear: "",
    cleanliness: 5,
    hobbies: "",
    smokeDrinkWeed: "",
    earliestClassTime: "",
    sleepTime: "",
    musicInRoom: "",
    extroversion: "",
    peopleOver: "",
    studyPreference: "",
    activityLevel: "",
    friendshipPreference: "",
    overnightStay: "",
    allergiesDiet: "",
    roomDecorations: "",
    shareCleaningSupplies: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (e) => {
    setFormData({ ...formData, cleanliness: parseInt(e.target.value) });
  };

  const handleSubmit = async () => {
    try {
      await setDoc(doc(firestore, "users", userID), formData, { merge: true });
      alert("Profile saved!");
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

      {/* Step 1: Basic Info */}
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
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          />
          <input
            type="number"
            name="graduationYear"
            placeholder="Graduation Year"
            value={formData.graduationYear}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          />
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full"
          >
            Next
          </button>
        </>
      )}

      {/* Step 2: Cleanliness (Slider) */}
      {step === 2 && (
        <>
          <label className="text-center mb-2">
            How clean do you keep your space? (1 = spotless, 10 = total
            disaster)
          </label>
          <input
            type="range"
            name="cleanliness"
            min="1"
            max="10"
            value={formData.cleanliness}
            onChange={handleSliderChange}
            className="w-full my-2"
          />
          <div className="flex justify-between w-full text-sm">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className={
                  i + 1 === formData.cleanliness
                    ? "text-yellow-500 font-bold"
                    : ""
                }
              >
                {i + 1}
              </span>
            ))}
          </div>
          <button
            onClick={prevStep}
            className="bg-gray-600 text-white p-2 rounded w-full mt-2"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 3: Major (Dropdown) */}
      {step === 3 && (
        <>
          <label className="text-center mb-2">What is your major?</label>
          <select
            name="major"
            value={formData.major}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white"
          >
            <option value="">Select Major</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mechanical Engineering">
              Mechanical Engineering
            </option>
            <option value="Business">Business</option>
          </select>
          <button
            onClick={prevStep}
            className="bg-gray-600 text-white p-2 rounded w-full mt-2"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Next
          </button>
        </>
      )}

      {/* Step 4: Hobbies (Short Answer) */}
      {step === 4 && (
        <>
          <label className="text-center mb-2">
            List any hobbies or activities you enjoy
          </label>
          <textarea
            name="hobbies"
            placeholder="Hiking, gaming, painting..."
            value={formData.hobbies}
            onChange={handleChange}
            className="p-2 mb-3 w-full rounded bg-gray-600 text-white h-24"
          ></textarea>
          <button
            onClick={prevStep}
            className="bg-gray-600 text-white p-2 rounded w-full mt-2"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Submit
          </button>
        </>
      )}

      {step === 5 && (
        <>
          <ProfilePictureUpload userID={userID} />
          <button
            onClick={prevStep}
            className="bg-gray-600 text-white p-2 rounded w-full mt-2"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="bg-yellow-500 text-black p-2 rounded w-full mt-2"
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
};

export default Questionnaire;
