// src/pages/Dashboard.js
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Profile from "./Profile";

const Dashboard = () => {
  const { user, logout } = useAuth0();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name} ({user.email})</p>
      <Profile />
      <button onClick={() => logout({ returnTo: window.location.origin })}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
