import { useState, useEffect } from "react";
import { socket } from "../socket";
import { AuthContext } from "./AuthContextInstance"; // ایمپورت از فایل جدید

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/location`, { 
        credentials: "include" 
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      setCurrentUser(null);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser?._id) {
      socket.connect();
      socket.emit("join_room", currentUser._id);
      return () => {
        socket.off("connect");
        socket.disconnect();
      };
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};