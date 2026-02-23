import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:3000", {
      auth: { token },
      transports: ["polling", "websocket"], // polling first, then upgrade
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", (err) =>
      console.error("Socket error:", err.message),
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const value = {
    socket: socketRef.current,
    isConnected,
    emit: (event, data) => socketRef.current?.emit(event, data),
    on: (event, cb) => socketRef.current?.on(event, cb),
    off: (event, cb) => socketRef.current?.off(event, cb),
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};

export default SocketContext;
