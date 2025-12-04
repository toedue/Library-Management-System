import { io } from 'socket.io-client';

// Socket server URL - should match backend
const SOCKET_URL = 'http://localhost:5000';
// const SOCKET_URL = 'https://library-management-system-backend-wi5k.onrender.com';

let socket = null;

/**
 * Connect to the socket server
 * @returns {Socket} The socket instance
 */
export const connectSocket = () => {
  // If already connected, return existing socket
  if (socket?.connected) {
    return socket;
  }

  // Get token from localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No token found, cannot connect to socket');
    return null;
  }

  // Create socket connection with authentication
  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Handle connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connected', (data) => {
    console.log('Socket authenticated:', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

/**
 * Disconnect from the socket server
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Listen to a socket event
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export const on = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  } else {
    console.warn(`Cannot listen to event "${event}": socket not connected`);
  }
};

/**
 * Remove a socket event listener
 * @param {string} event - Event name
 * @param {Function} callback - Optional callback function
 */
export const off = (event, callback) => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};

/**
 * Emit an event to the server
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
export const emit = (event, data) => {
  if (socket?.connected) {
    socket.emit(event, data);
  } else {
    console.warn(`Cannot emit event "${event}": socket not connected`);
  }
};

/**
 * Get the current socket instance
 * @returns {Socket|null} The socket instance or null
 */
export const getSocket = () => {
  return socket;
};


