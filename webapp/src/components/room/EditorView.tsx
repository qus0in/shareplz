import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Edit3, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface EditorViewProps {
    id: string;
    role: "viewer" | "editor";
    content: string;
    status: "connecting" | "connected" | "disconnected";
    pin: string;
    setPin: (pin: string) => void;
    onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onAuth: () => void;
}

/**
 * 에디터 화면 컴포넌트
 */
export function EditorView({ id, role, content, status, pin, setPin, onContentChange, onAuth }: EditorViewProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <main className="flex flex-col h-screen bg-zinc-950 text-zinc-300 overflow-hidden font-mono">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-sm font-bold text-white tracking-tighter flex items-center gap-2">
                        <Share2 size={14} className="text-blue-500" />
                        SHAREPLZ / <span className="text-zinc-500 font-normal">{id}</span>
                    </h1>
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">{status}</span>
                    </div>
                    {role === "editor" && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <ShieldCheck size={10} />
                            <span className="text-[10px] uppercase font-bold tracking-tighter">Editor</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {role === "viewer" && (
                        <div className="relative group">
                            <Input
                                type="password"
                                maxLength={6}
                                placeholder="편집 PIN 6자리 입력"
                                className="h-8 w-40 bg-zinc-900 border-zinc-800 text-[10px] focus:w-48 transition-all"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                                onKeyDown={(e) => e.key === 'Enter' && onAuth()}
                            />
                            <Edit3 size={12} className="absolute right-2 top-2.5 text-zinc-600 pointer-events-none" />
                        </div>
                    )}
                    <Button variant="outline" size="sm" className="h-8 text-[10px] border-zinc-800 bg-transparent text-zinc-500 hover:bg-zinc-900" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("링크 복사 완료");
                    }}>
                        COPY LINK
                    </Button>
                </div>
            </header>

            {/* Editor Area */}
            <div className="flex-1 relative">
                <div className="absolute top-4 left-6 text-[9px] text-zinc-800 pointer-events-none select-none flex gap-4 uppercase z-10">
                    <span>$ ROLE: {role}</span>
                    <span>$ ROOM_ID: {id}</span>
                </div>

                {/* 주석 하이라이팅 및 링크 감지 오버레이 */}
                <div className="absolute inset-0 p-8 pt-12 overflow-hidden pointer-events-none font-mono text-lg leading-relaxed whitespace-pre-wrap break-words">
                    {content.split('\n').map((line, idx) => {
                        const isComment = line.trim().startsWith('#') || line.trim().startsWith('//');
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const parts = line.split(urlRegex);

                        return (
                            <div key={idx} className={isComment ? 'text-zinc-600 italic' : 'text-zinc-100'}>
                                {isComment ? (
                                    // 주석일 경우 링크 변환 안함
                                    <span>{line || '\u00A0'}</span>
                                ) : (
                                    // 일반 텍스트는 URL을 링크로 변환
                                    parts.map((part, partIdx) => {
                                        if (part.match(urlRegex)) {
                                            return (
                                                <a
                                                    key={partIdx}
                                                    href={part}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 underline hover:text-blue-300 pointer-events-auto cursor-pointer"
                                                >
                                                    {part}
                                                </a>
                                            );
                                        }
                                        return <span key={partIdx}>{part || (line === '' ? '\u00A0' : '')}</span>;
                                    })
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 실제 입력 textarea */}
                <textarea
                    ref={textareaRef}
                    className={`relative w-full h-full p-8 pt-12 bg-transparent text-zinc-100 text-lg resize-none outline-none font-mono leading-relaxed caret-zinc-100 ${role !== "editor" ? "cursor-default pointer-events-none" : ""}`}
                    spellCheck={false}
                    value={content}
                    onChange={onContentChange}
                    readOnly={role !== "editor"}
                    placeholder={role === "editor" ? "내용을 입력하세요..." : "권한이 없습니다 (읽기 전용)."}
                    style={{ color: 'transparent', caretColor: '#f4f4f5' }}
                />
            </div>

            {/* Status Bar */}
            <footer className="px-6 py-1.5 border-t border-zinc-900 bg-zinc-950 flex justify-between items-center text-[9px] text-zinc-700 uppercase tracking-tight">
                <div className="flex gap-4">
                    <span>UTF-8 / NO_WRAP</span>
                    <span>SIZE: {new Blob([content]).size}B</span>
                </div>
                <div className="flex items-center gap-1">
                    <CheckCircle2 size={10} className={status === 'connected' ? "text-blue-900" : "text-zinc-900"} />
                    SYCHRONIZED_WITH_D1_ENGINE
                </div>
            </footer>
        </main>
    );
}
