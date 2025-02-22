import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Welcome from "./pages/Welcome";
import RoommateRequestGuide from "./pages/RoommateRequestGuide";
import Home from "./pages/Home";
import Friends from "./pages/Friends";
import Questionnaire from "./pages/Questionnaire";
import Chat from "./pages/Chat"; 
import Profile from "./pages/Profile";// ✅ Import Chat Page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/roommate-request" element={<RoommateRequestGuide />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/chat" element={<Chat />} />{" "}
        <Route path="/profile" element={<Profile />} />
        <Route path="/401" element={<Navigate to="/" />} />
        {/* ✅ Added Chat Page Route */}
      </Routes>
    </Router>
  );
}

export default App;
