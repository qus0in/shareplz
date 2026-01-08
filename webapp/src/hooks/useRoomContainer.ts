import { useRef, useEffect } from "react";
import { useRoom } from "./useRoom";
import { useAuth } from "./useAuth";
import { nanoid } from "nanoid";

export function useRoomContainer(id: string) {
    const { role, setRole, content, setContent, ws, loading, status, lockedBy, isEditing, requiresReadAuth, triggerEditingState } = useRoom(id);
    const { pin, setPin, handleAuth } = useAuth(id, role, loading, setRole);

    const userIdRef = useRef<string>("");
    const lastSentTimeRef = useRef(0);
    const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 고유 사용자 ID 생성 (탭당 하나)
    useEffect(() => {
        userIdRef.current = nanoid(8);
    }, []);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (role !== "editor") return;

        // 다른 사람이 편집 중이면 차단
        if (lockedBy && lockedBy !== userIdRef.current) {
            return;
        }

        const newContent = e.target.value;
        setContent(newContent);
        triggerEditingState();

        if (ws && ws.readyState === WebSocket.OPEN) {
            const now = Date.now();
            const THROTTLE_MS = 100;

            // 잠금 획득 시도 (첫 입력 시 또는 잠금 소유자가 아닐 때)
            if (!lockedBy) {
                ws.send(JSON.stringify({ type: "editing_start", userId: userIdRef.current }));
            }

            if (throttleTimeoutRef.current) {
                clearTimeout(throttleTimeoutRef.current);
                throttleTimeoutRef.current = null;
            }

            if (now - lastSentTimeRef.current >= THROTTLE_MS) {
                ws.send(JSON.stringify({ type: "update", content: newContent, userId: userIdRef.current }));
                lastSentTimeRef.current = now;
            } else {
                throttleTimeoutRef.current = setTimeout(() => {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: "update", content: newContent, userId: userIdRef.current }));
                        lastSentTimeRef.current = Date.now();
                    }
                }, THROTTLE_MS - (now - lastSentTimeRef.current));
            }
        }
    };

    return {
        role,
        content,
        status,
        lockedBy,
        userId: userIdRef.current,
        isEditing,
        requiresReadAuth,
        pin,
        loading,
        setPin,
        handleAuth,
        handleContentChange,
    };
}

