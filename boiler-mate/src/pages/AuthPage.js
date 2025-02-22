// src/pages/AuthPage.js
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthPage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div>
      <h2>Welcome to Boilermate</h2>
      <p>Please log in using your Purdue email.</p>
      <button onClick={() => loginWithRedirect()}>Login with Purdue Email</button>
    </div>
  );
};

export default AuthPage;
