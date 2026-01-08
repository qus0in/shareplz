import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * 방 데이터 및 WebSocket 연결을 관리하는 커스텀 훅
 */
export function useRoom(id: string) {
    const router = useRouter();
    const [role, setRole] = useState<"none" | "viewer" | "editor">("none");
    const [content, setContent] = useState("");
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
    const [requiresReadAuth, setRequiresReadAuth] = useState(false);

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

    // WebSocket 연결
    useEffect(() => {
        if (role === "none") return;

        setStatus("connecting");
        const socket = new WebSocket(`wss://shareplz-server.qus0in.workers.dev?roomId=${id}`);

        socket.onopen = () => {
            setStatus("connected");
            if (role === "editor") toast.success("편집 모드 활성화");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data) as { type: string; content?: string };
            if (data.type === "init") {
                if (data.content !== undefined && !content) setContent(data.content);
            } else if (data.type === "update" && data.content !== undefined) {
                setContent(data.content);
            }
        };

        socket.onclose = () => setStatus("disconnected");
        setWs(socket);

        return () => socket.close();
    }, [id, role]);

    return {
        role,
        setRole,
        content,
        setContent,
        ws,
        loading,
        status,
        requiresReadAuth,
    };
}
