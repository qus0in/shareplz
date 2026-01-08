"use client";

import { useParams } from "next/navigation";
import { useRoomContainer } from "@/hooks/useRoomContainer";
import { AccessProtected } from "@/components/room/AccessProtected";
import { EditorView } from "@/components/room/EditorView";

/**
 * 공유방 상세 페이지
 */
export const runtime = 'edge';

export default function RoomPage() {
    const { id } = useParams() as { id: string };
    const {
        role,
        content,
        status,
        lockedBy,
        userId,
        isEditing,
        requiresReadAuth,
        pin,
        loading,
        setPin,
        handleAuth,
        handleContentChange,
    } = useRoomContainer(id);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-blue-500 font-mono text-sm tracking-tighter">
                <div className="animate-pulse">_INITIALIZING_SYSTEM_BUFFER...</div>
            </div>
        );
    }

    if (role === "none" && requiresReadAuth) {
        return <AccessProtected pin={pin} setPin={setPin} onAuth={handleAuth} />;
    }

    return (
        <EditorView
            id={id}
            role={role === "none" ? "viewer" : role}
            content={content}

            status={status}
            lockedBy={lockedBy}
            userId={userId}
            isEditing={isEditing}
            pin={pin}
            setPin={setPin}
            onContentChange={handleContentChange}
            onAuth={handleAuth}
        />
    );
}
