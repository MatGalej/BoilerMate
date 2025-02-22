import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import RoommateRequestGuide from "./pages/RoommateRequestGuide";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Redirect "/" to Home */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/roommate-request" element={<RoommateRequestGuide />} />
      </Routes>
    </Router>
  );
}

export default App;
