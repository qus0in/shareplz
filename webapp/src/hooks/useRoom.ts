import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * 방 데이터 및 WebSocket 연결을 관리하는 커스텀 훅
 * 재연결 로직 구현
 */
export function useRoom(id: string) {
    const router = useRouter();
    const [role, setRole] = useState<"none" | "viewer" | "editor">("none");
    const [content, setContent] = useState("");
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
    const [isEditing, setIsEditing] = useState(false);
    const [requiresReadAuth, setRequiresReadAuth] = useState(false);

    // 재연결을 위한 ref
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isUnmountingRef = useRef(false);
    const wsRef = useRef<WebSocket | null>(null);
    const editTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // 편집 상태 트리거 (디바운스)
    const triggerEditingState = () => {
        setIsEditing(true);
        if (editTimeoutRef.current) clearTimeout(editTimeoutRef.current);
        editTimeoutRef.current = setTimeout(() => {
            setIsEditing(false);
        }, 1000);
    };

    // WebSocket 연결 함수
    const connectWebSocket = useCallback(() => {
        if (isUnmountingRef.current) return;

        // 이미 연결되어 있거나 연결 중이면 스킵
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const socket = new WebSocket(`wss://shareplz-server.qus0in.workers.dev?roomId=${id}`);
        wsRef.current = socket;

        setStatus("connecting");

        socket.onopen = () => {
            setStatus("connected");

            // 재연결 타이머 클리어
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data) as { type: string; content?: string };
            if (data.type === "init") {
                if (data.content !== undefined) setContent(data.content);
            } else if (data.type === "update" && data.content !== undefined) {
                setContent(data.content);
                // 수신 시에도 편집 중 상태 잠깐 표시
                triggerEditingState();
            }
        };

        socket.onclose = (event) => {
            if (isUnmountingRef.current) return;

            setStatus("disconnected");
            wsRef.current = null;

            // 비정상 종료 시 재연결 시도 (1~3초 랜덤 딜레이)
            if (!event.wasClean) {
                const delay = 1000 + Math.random() * 2000;
                console.log(`WebSocket closed. Reconnecting inside ${delay}ms...`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectWebSocket();
                }, delay);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        setWs(socket);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // 초기 연결 및 역할 변경 시 연결
    useEffect(() => {
        isUnmountingRef.current = false;

        // 로딩이 끝나고, (읽기 권한이 필요 없거나 역할을 부여받았을 때) 연결 시도
        // requiresReadAuth가 true이고 role이 none이면(아직 인증 전) 연결하지 않음
        // 하지만 requiresReadAuth가 false이거나 role이 있으면 연결
        if (!loading && (!requiresReadAuth || role !== "none")) {
            connectWebSocket();
        }

        return () => {
            isUnmountingRef.current = true;
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (editTimeoutRef.current) {
                clearTimeout(editTimeoutRef.current);
            }
        };
    }, [connectWebSocket, loading, role, requiresReadAuth]);

    // 페이지 가시성 변경 시 재연결 (탭 복귀 시)
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
