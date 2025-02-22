import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Welcome from "./pages/welcome";
import RoommateRequestGuide from "./pages/RoommateRequestGuide";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} /> {/* Redirect "/" to Home */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/roommate-request" element={<RoommateRequestGuide />} />

      </Routes>
    </Router>
  );
}

export default App;
