import React, { createContext, useContext, useEffect } from 'react';
import { initSocket, disconnectSocket, getSocket } from '../utils/socket';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, serverUrl }) => {
    useEffect(() => {
        // Initialize socket on mount
        initSocket(serverUrl);

        return () => {
            // Cleanup on unmount
            // Không disconnect ngay để tránh mất connection
            // Có thể disconnect khi user logout
        };
    }, [serverUrl]);

    const socket = getSocket();

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        console.warn('useSocket must be used within SocketProvider');
    }
    return socket;
};
