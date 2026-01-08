import { useRef, useCallback, useState, useEffect } from "react";
import { WebSocketManager } from "@/lib/WebSocketManager";

interface UseWebSocketRoomProps {
    id: string;
    onContentUpdate: (content: string) => void;
    onEditingStateTrigger: () => void;
}

export function useWebSocketRoom({ id, onContentUpdate, onEditingStateTrigger }: UseWebSocketRoomProps) {
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
    const [ws, setWs] = useState<WebSocket | null>(null);

    const wsManagerRef = useRef<WebSocketManager | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isUnmountingRef = useRef(false);

    const connectWebSocket = useCallback(() => {
        if (isUnmountingRef.current) return;

        if (wsManagerRef.current && wsManagerRef.current.isConnected()) {
            return;
        }

        setStatus("connecting");

        wsManagerRef.current = new WebSocketManager(id, {
            onOpen: () => {
                setStatus("connected");
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            },
            onMessage: (data) => {
                if (data.type === "init") {
                    if (data.content !== undefined) onContentUpdate(data.content);
                } else if (data.type === "update" && data.content !== undefined) {
                    onContentUpdate(data.content);
                    onEditingStateTrigger();
                }
            },
            onClose: (event) => {
                if (isUnmountingRef.current) return;

                setStatus("disconnected");
                setWs(null);

                if (!event.wasClean) {
                    const delay = 1000 + Math.random() * 2000;
                    console.log(`WebSocket closed. Reconnecting inside ${delay}ms...`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, delay);
                }
            },
            onError: (error) => {
                console.error("WebSocket error:", error);
            }
        });

        wsManagerRef.current.connect();
        setWs(wsManagerRef.current.getSocket());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const disconnect = useCallback(() => {
        isUnmountingRef.current = true;
        wsManagerRef.current?.disconnect();
        wsManagerRef.current = null;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
    }, []);

    useEffect(() => {
        isUnmountingRef.current = false;
        return () => disconnect();
    }, [disconnect]);

    return {
        ws,
        status,
        connectWebSocket,
        isUnmountingRef
    };
}
