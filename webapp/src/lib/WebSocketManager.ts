
/**
 * WebSocket 관련 로직을 관리하는 유틸리티 클래스
 */
export class WebSocketManager {
    private ws: WebSocket | null = null;
    private id: string;
    private onOpen?: () => void;
    private onMessage?: (data: { type: string; content?: string }) => void;
    private onClose?: (event: CloseEvent) => void;
    private onError?: (error: Event) => void;

    constructor(id: string, handlers: {
        onOpen?: () => void;
        onMessage?: (data: { type: string; content?: string }) => void;
        onClose?: (event: CloseEvent) => void;
        onError?: (error: Event) => void;
    }) {
        this.id = id;
        this.onOpen = handlers.onOpen;
        this.onMessage = handlers.onMessage;
        this.onClose = handlers.onClose;
        this.onError = handlers.onError;
    }

    public connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.ws = new WebSocket(`wss://shareplz-server.qus0in.workers.dev?roomId=${this.id}`);

        this.ws.onopen = () => {
            this.onOpen?.();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.onMessage?.(data);
        };

        this.ws.onclose = (event) => {
            this.ws = null;
            this.onClose?.(event);
        };

        this.ws.onerror = (error) => {
            this.onError?.(error);
        };
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public getSocket() {
        return this.ws;
    }

    public isConnected() {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}
