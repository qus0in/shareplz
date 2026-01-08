import { useRef } from "react";
import { useRoom } from "./useRoom";
import { useAuth } from "./useAuth";

export function useRoomContainer(id: string) {
    const { role, setRole, content, setContent, ws, loading, status, isEditing, requiresReadAuth, triggerEditingState } = useRoom(id);
    const { pin, setPin, handleAuth } = useAuth(id, role, loading, setRole);

    const lastSentTimeRef = useRef(0);
    const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (role !== "editor") return;

        const newContent = e.target.value;
        setContent(newContent);
        triggerEditingState();

        const now = Date.now();
        const THROTTLE_MS = 100;

        if (throttleTimeoutRef.current) {
            clearTimeout(throttleTimeoutRef.current);
            throttleTimeoutRef.current = null;
        }

        if (now - lastSentTimeRef.current >= THROTTLE_MS) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "update", content: newContent }));
                lastSentTimeRef.current = now;
            }
        } else {
            throttleTimeoutRef.current = setTimeout(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "update", content: newContent }));
                    lastSentTimeRef.current = Date.now();
                }
            }, THROTTLE_MS - (now - lastSentTimeRef.current));
        }
    };

    return {
        role,
        content,
        status,
        isEditing,
        requiresReadAuth,
        pin,
        loading,
        setPin,
        handleAuth,
        handleContentChange,
    };
}
