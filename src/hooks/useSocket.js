import { useEffect, useCallback } from 'react';
import { onSocketEvent, getSocket } from '../utils/socket';

/**
 * Custom hook to listen for WebSocket events
 * @param {string} eventName - Event name to listen for
 * @param {function} callback - Callback function when event fires
 * @param {array} dependencies - Dependency array for cleanup
 */
export const useSocketEvent = (eventName, callback, dependencies = []) => {
    useEffect(() => {
        if (!eventName || !callback) return;

        const unsubscribe = onSocketEvent(eventName, callback);
        
        return () => unsubscribe();
    }, [eventName, callback, ...dependencies]);
};

/**
 * Custom hook to emit WebSocket events
 */
export const useSocketEmit = () => {
    return useCallback((eventName, data) => {
        const socket = getSocket();
        if (socket && socket.connected) {
            socket.emit(eventName, data);
        }
    }, []);
};

/**
 * Custom hook to monitor socket connection status
 */
export const useSocketStatus = () => {
    const socket = getSocket();
    return {
        connected: socket?.connected || false,
        id: socket?.id || null
    };
};
