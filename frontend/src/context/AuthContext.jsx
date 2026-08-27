import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import apiFetch from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // our Firestore profile (has role)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const myProfile = await apiFetch("/users/me/");
          setProfile(myProfile);
        } catch (err) {
          console.error("Failed to fetch profile:", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signup(name, email, password, phone) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Register the Firestore profile right after Firebase Auth account is created
    await apiFetch("/users/register/", {
      method: "POST",
      body: {
        firebase_uid: userCredential.user.uid,
        name,
        email,
        phone,
        is_active: true,
      },
    });

    const myProfile = await apiFetch("/users/me/");
    setProfile(myProfile);
  }

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
    const myProfile = await apiFetch("/users/me/");
    setProfile(myProfile);
    return myProfile;
  }

  async function logout() {
    await signOut(auth);
    setProfile(null);
  }

  const value = { firebaseUser, profile, loading, signup, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}