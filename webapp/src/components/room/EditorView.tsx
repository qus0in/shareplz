import { EditorHeader } from "@/components/room/editor/EditorHeader";
import { EditorArea } from "@/components/room/editor/EditorArea";
import { EditorFooter } from "@/components/room/editor/EditorFooter";

interface EditorViewProps {
    id: string;
    role: "viewer" | "editor";
    content: string;
    status: "connecting" | "connected" | "disconnected";
    isEditing: boolean;
    pin: string;
    setPin: (pin: string) => void;
    onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onAuth: () => void;
}

/**
 * 에디터 화면 메인 컴포넌트
 */
export function EditorView({ id, role, content, status, isEditing, pin, setPin, onContentChange, onAuth }: EditorViewProps) {
    return (
        <main className="flex flex-col h-screen bg-zinc-950 text-zinc-300 overflow-hidden font-mono">
            <EditorHeader
                id={id}
                role={role}
                status={status}
                isEditing={isEditing}
                pin={pin}
                content={content}
                setPin={setPin}
                onAuth={onAuth}
            />

            <EditorArea
                role={role}
                content={content}
                onContentChange={onContentChange}
            />

            <EditorFooter
                content={content}
                status={status}
            />
        </main>
    );
}
