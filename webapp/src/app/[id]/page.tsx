"use client";

import { useParams } from "next/navigation";
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
    const { role, setRole, content, setContent, ws, loading, status, requiresReadAuth } = useRoom(id);
    const { pin, setPin, handleAuth } = useAuth(id, role, loading, setRole);

    // 내용 변경 핸들러
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (role !== "editor") return;

        const newContent = e.target.value;
        setContent(newContent);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "update", content: newContent }));
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
            pin={pin}
            setPin={setPin}
            onContentChange={handleContentChange}
            onAuth={() => handleAuth()}
        />
    );
}
