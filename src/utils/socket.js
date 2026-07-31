import io from 'socket.io-client';

let socket = null;

/**
 * Initialize WebSocket connection
 * @param {string} serverUrl - Server URL (e.g., http://localhost:3001)
 */
export const initSocket = (serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001') => {
    if (socket && socket.connected) {
        console.log('Socket already connected');
        return socket;
    }

    socket = io(serverUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log('✅ WebSocket connected:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
    });

    socket.on('error', (error) => {
        console.error('⚠️ WebSocket error:', error);
    });

    return socket;
};

/**
 * Get existing socket instance
 */
export const getSocket = () => {
    if (!socket) {
        console.warn('Socket not initialized. Call initSocket() first.');
        return initSocket();
    }
    return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket disconnected');
    }
};

/**
 * Subscribe to event
 */
export const onSocketEvent = (eventName, callback) => {
    const socketInstance = getSocket();
    socketInstance.on(eventName, callback);
    
    // Return unsubscribe function
    return () => socketInstance.off(eventName, callback);
};

/**
 * Emit event
 */
export const emitSocketEvent = (eventName, data) => {
    const socketInstance = getSocket();
    socketInstance.emit(eventName, data);
};
