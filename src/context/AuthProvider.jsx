// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { socket } from "../socket";
import { AuthContext } from "./AuthContextInstance";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();

  const checkAuth = async () => {
    try {
      

      const res = await fetch(`${API_URL}/api/user/getUserInformation`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        console.log(data);
        return true;
      }

      if (res.status === 401) {
        setCurrentUser(null);
        return false;
      }

      return false;
    } catch (err) {
      console.error(err);
      setCurrentUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🔁 هر بار route عوض شد auth را sync کن
  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  // 🔌 socket management
  useEffect(() => {
    if (currentUser?._id) {
      if (!socket.connected) socket.connect();
      socket.emit("join_room", currentUser._id);
    } else {
      if (socket.connected) socket.disconnect();
    }

    return () => {
      socket.off("connect");
    };
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
