// frontend/src/services/websocket.js
let wsInstance = null;

// Determine WebSocket URL based on environment
const getWebSocketUrl = (interviewId, token) => {
    // For local development, assuming backend runs on 5000
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const port = process.env.NODE_ENV === 'development' ? ':5000' : ''; // Adjust port for production if needed
    return `${protocol}//${hostname}${port}?interviewId=${interviewId}&token=${token}`;
};

export const connectWebSocket = (interviewId, token) => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected.');
        return wsInstance;
    }

    const wsUrl = getWebSocketUrl(interviewId, token);
    wsInstance = new WebSocket(wsUrl);

    wsInstance.onopen = () => {
        console.log('WebSocket connection opened:', wsUrl);
    };

    wsInstance.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        wsInstance = null; // Clear instance on close
    };

    wsInstance.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    return wsInstance;
};

export const disconnectWebSocket = (ws) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Client initiated disconnect');
        console.log('WebSocket connection closed by client.');
    }
    wsInstance = null;
};

export const getWebSocket = () => wsInstance;