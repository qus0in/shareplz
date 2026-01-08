"use client";

import { useParams } from "next/navigation";
import { useRef } from "react";
import { useRoom } from "@/hooks/useRoom";
import { useAuth } from "@/hooks/useAuth";
import { AccessProtected } from "@/components/room/AccessProtected";
import { EditorView } from "@/components/room/EditorView";

/**
 * 공유방 상세 페이지
 */
export const runtime = 'edge';

export default function RoomPage() {
    const { id } = useParams() as { id: string };
    const { role, setRole, content, setContent, ws, loading, status, isEditing, requiresReadAuth, triggerEditingState } = useRoom(id);
    const { pin, setPin, handleAuth } = useAuth(id, role, loading, setRole);

    // Throttling을 위한 refs
    const lastSentTimeRef = useRef(0);
    const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 내용 변경 핸들러 (Throttled)
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (role !== "editor") return;

        const newContent = e.target.value;
        setContent(newContent);
        triggerEditingState();

        const now = Date.now();
        const THROTTLE_MS = 100; // 100ms 제한

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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-blue-500 font-mono text-sm tracking-tighter">
                <div className="animate-pulse">_INITIALIZING_SYSTEM_BUFFER...</div>
            </div>
        );
    }

    if (role === "none" && requiresReadAuth) {
        return <AccessProtected pin={pin} setPin={setPin} onAuth={() => handleAuth()} />;
    }

    return (
        <EditorView
            id={id}
            role={role as "viewer" | "editor"}
            content={content}
            status={status}
            isEditing={isEditing}
            pin={pin}
            setPin={setPin}
            onContentChange={handleContentChange}
            onAuth={() => handleAuth()}
        />
    );
}
