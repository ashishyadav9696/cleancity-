import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  if (hostname.endsWith('.onrender.com') && hostname.includes('-frontend')) {
    const backendHost = hostname.replace('-frontend', '-backend');
    return `https://${backendHost}`;
  }
  return window.location.origin;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    if (user) {
      socket.emit('join', user._id);
      socket.emit('join_role', user.role);
    }

    return () => { socket.disconnect(); };
  }, [user]);

  const subscribe = (event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, subscribe }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
