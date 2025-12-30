import { useContext } from "react";
import { SocketContext } from "./SocketContext";

/**
 * useSocket: A custom hook to access the current socket instance.
 * Separated into its own file to maintain clean architecture and fix HMR warnings.
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};