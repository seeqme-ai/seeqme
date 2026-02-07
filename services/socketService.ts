const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace('/api/v1', '').replace('http', 'ws') + '/ws';

class SocketService {
    private socket: WebSocket | null = null;
    private logCallback: ((log: any) => void) | null = null;
    private completeCallback: ((data: any) => void) | null = null;
    private failureCallback: ((error: any) => void) | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    private messageQueue: any[] = [];

    connect(token?: string, userId?: string) {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;
        this.socket = new WebSocket(WS_URL);

        this.socket.onopen = () => {
            console.log('✅ Connected to Seeqme Engine Socket');
            this.reconnectAttempts = 0;
            if (userId) this.subscribeToUser(userId);

            // Flush queued messages
            while (this.messageQueue.length > 0) {
                const payload = this.messageQueue.shift();
                this.send(payload);
            }
        };

        this.socket.onmessage = (event) => {
            try {
                const { event: eventName, data } = JSON.parse(event.data);
                console.log(`📬 Received ${eventName}:`, data);

                switch (eventName) {
                    case 'portfolio_log':
                        if (this.logCallback) this.logCallback(data);
                        break;
                    case 'deployment_complete':
                        if (this.completeCallback) this.completeCallback(data);
                        break;
                    case 'deployment_failed':
                        if (this.failureCallback) this.failureCallback(data);
                        break;
                }
            } catch (e) {
                console.warn('⚠️ Received non-JSON message:', event.data);
            }
        };

        this.socket.onclose = (event) => {
            console.warn('❌ Socket disconnected:', event.reason);
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                setTimeout(() => this.connect(token, userId), 2000);
            }
        };

        this.socket.onerror = (error) => {
            console.error('❌ Socket Error:', error);
        };
    }

    setCallbacks(
        onLog: (log: any) => void,
        onComplete: (data: any) => void,
        onFailure: (error: any) => void
    ) {
        this.logCallback = onLog;
        this.completeCallback = onComplete;
        this.failureCallback = onFailure;
    }

    private send(payload: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(payload));
        } else if (this.socket?.readyState === WebSocket.CONNECTING) {
            console.log('⏳ Socket connecting, queuing message:', payload);
            this.messageQueue.push(payload);
        } else {
            console.error('🚫 Socket not open. Cannot send:', payload);
        }
    }

    private subscribeToUser(userId: string) {
        this.send({ type: 'subscribe', room: `user:${userId}` });
    }

    subscribeToSession(sessionId: string) {
        this.send({ type: 'subscribe', room: `session:${sessionId}` });
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
            this.logCallback = null;
            this.completeCallback = null;
        }
    }
}

export const socketService = new SocketService();
