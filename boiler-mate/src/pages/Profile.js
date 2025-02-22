import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const Profile = () => {
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRef = doc(db, "users", user.sub);
      setDoc(userRef, {
        name: user.name,
        email: user.email,
        picture: user.picture,
      });
    }
  }, [isAuthenticated, user]);

  return (
    isAuthenticated && (
      <div>
        <h2>Welcome, {user.name}!</h2>
        <img src={user.picture} alt={user.name} width="100" />
        <p>Email: {user.email}</p>
      </div>
    )
  );
};

export default Profile;
