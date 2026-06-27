import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../components/firebase/firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      switch (e.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setAuthError("Invalid email or password.");
          break;
        case "auth/too-many-requests":
          setAuthError("Too many attempts. Please try again later.");
          break;
        default:
          setAuthError("Login failed. Please try again.");
      }
      throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 🕒 Auto logout after 5 minutes of inactivity
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      // 5 minutes = 300000 ms
      timer = setTimeout(() => {
        logout();
        alert("You have been logged out due to inactivity.");
      },3000000);
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    // Start timer initially
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, authLoading, authError, setAuthError, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
