import { API_BASE_URL } from './apiService';

const WS_URL = API_BASE_URL.replace('/api/v1', '').replace('http', 'ws') + '/ws';

type SocketListener = (data: any) => void;

class SocketService {
    private socket: WebSocket | null = null;
    private listeners: Map<string, Set<SocketListener>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private messageQueue: any[] = [];

    connect(token?: string, userId?: string) {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;
        
        console.log('🔌 Connecting to Mesh Network...');
        this.socket = new WebSocket(WS_URL);

        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            if (userId) this.subscribeToUser(userId);
            this.subscribeToFeed();

            // Flush queued messages
            while (this.messageQueue.length > 0) {
                const payload = this.messageQueue.shift();
                this.send(payload);
            }
        };

        this.socket.onmessage = (event) => {
            try {
                const { event: eventName, data } = JSON.parse(event.data);
                
                // Trigger specific listeners
                const eventListeners = this.listeners.get(eventName);
                if (eventListeners) {
                    eventListeners.forEach(cb => cb(data));
                }
            } catch (e) {
                console.warn('⚠️ Received non-JSON message:', event.data);
            }
        };

        this.socket.onclose = (event) => {
            console.warn('❌ Socket disconnected:', event.reason);
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => this.connect(token, userId), 2000);
            }
        };

        this.socket.onerror = (error) => {
            console.error('❌ Socket Error:', error);
        };
    }

    on(event: string, callback: SocketListener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    off(event: string, callback: SocketListener) {
        this.listeners.get(event)?.delete(callback);
    }

    private send(payload: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(payload));
        } else if (this.socket?.readyState === WebSocket.CONNECTING) {
            this.messageQueue.push(payload);
        } else {
            if (payload.type !== 'unsubscribe') {
                console.error('🚫 Socket not open. Cannot send:', payload);
            }
        }
    }

    private subscribeToUser(userId: string) {
        this.send({ type: 'subscribe', room: `user:${userId}` });
    }

    private subscribeToFeed() {
        this.send({ type: 'subscribe', room: 'social_feed' });
    }

    subscribeToPost(postId: string) {
        this.send({ type: 'subscribe', room: `post:${postId}` });
    }

    unsubscribeFromPost(postId: string) {
        this.send({ type: 'unsubscribe', room: `post:${postId}` });
    }

    subscribeToSession(sessionId: string) {
        this.send({ type: 'subscribe', room: `session:${sessionId}` });
    }

    setCallbacks(
        onLog?: (log: any) => void,
        onComplete?: (data: any) => void,
        onError?: (err: any) => void
    ) {
        // Map traditional callbacks to the new event listener system
        if (onLog) this.on('deployment_log', onLog);
        if (onComplete) this.on('deployment_complete', onComplete);
        if (onError) this.on('deployment_error', onError);
    }

    subscribeToPortfolio(portfolioId: string) {
        this.send({ type: 'subscribe', room: `portfolio:${portfolioId}` });
    }

    unsubscribeFromPortfolio(portfolioId: string) {
        this.send({ type: 'unsubscribe', room: `portfolio:${portfolioId}` });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.listeners.clear();
        }
    }
}

export const socketService = new SocketService();
