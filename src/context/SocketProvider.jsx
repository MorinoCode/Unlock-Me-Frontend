import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";
import { SocketContext } from "./SocketContext";

/**
 * SocketProvider: Encapsulates socket connection logic.
 * Must be child of AuthProvider.
 */
export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!currentUser?._id) return;

    const socketInstance = io(API_URL, {
      withCredentials: true,
      transports: ["websocket"],
      query: { userId: currentUser._id },
    });

    socketInstance.on("connect", () => {
      setSocket(socketInstance);
      socketInstance.emit("join_room", currentUser._id);
    });

    socketInstance.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      if (socketInstance) {
        socketInstance.close();
        setSocket(null);
      }
    };
  }, [currentUser?._id, API_URL]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};