import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWebSocketRoom } from "./useWebSocketRoom";

/**
 * 방 데이터 및 WebSocket 연결을 관리하는 커스텀 훅
 */
export function useRoom(id: string) {
    const router = useRouter();
    const [role, setRole] = useState<"none" | "viewer" | "editor">("none");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [requiresReadAuth, setRequiresReadAuth] = useState(false);

    const editTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 편집 상태 트리거 (디바운스)
    const triggerEditingState = useCallback(() => {
        setIsEditing(true);
        if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
        editTimeoutRef.current = setTimeout(() => {
            setIsEditing(false);
        }, 1000);
    }, []);

    // WebSocket 훅 사용
    const { ws, status, connectWebSocket, isUnmountingRef } = useWebSocketRoom({
        id,
        onContentUpdate: setContent,
        onEditingStateTrigger: triggerEditingState
    });

    // D1에서 초기 데이터 로드
    const fetchRoom = useCallback(async () => {
        try {
            const res = await fetch(`/api/room/${id}`);
            if (res.ok) {
                const data = await res.json() as { content: string | null; requiresReadAuth: boolean };
                setRequiresReadAuth(data.requiresReadAuth);

                if (!data.requiresReadAuth) {
                    setRole("viewer");
                    setContent(data.content || "");
                }
                setLoading(false);
            } else {
                toast.error("방을 찾을 수 없습니다.");
                router.push("/");
            }
        } catch (e) {
            console.error("Fetch room error:", e);
        }
    }, [id, router]);

    useEffect(() => {
        fetchRoom();
    }, [fetchRoom]);

    // 초기 연결 및 역할 변경 시 연결
    useEffect(() => {
        isUnmountingRef.current = false;

        if (!loading && (!requiresReadAuth || role !== "none")) {
            connectWebSocket();
        }

        return () => {
            if (editTimeoutRef.current) {
                clearTimeout(editTimeoutRef.current);
            }
        };
    }, [connectWebSocket, loading, role, requiresReadAuth, isUnmountingRef]);

    // 페이지 가시성 변경 시 재연결
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && status === 'disconnected') {
                connectWebSocket();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [connectWebSocket, status]);

    return {
        role,
        setRole,
        content,
        setContent,
        ws,
        loading,
        status,
        isEditing,
        requiresReadAuth,
        triggerEditingState
    };
}
