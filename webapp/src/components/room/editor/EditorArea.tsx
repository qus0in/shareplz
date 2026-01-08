import { useRef } from "react";
import { Lock } from "lucide-react";

interface EditorAreaProps {
    role: "viewer" | "editor";
    content: string;
    lockedBy: string | null;
    userId: string;
    onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function EditorArea({ role, content, lockedBy, userId, onContentChange }: EditorAreaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    const isLockedByOther = lockedBy !== null && lockedBy !== userId;

    const handleScroll = () => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    return (
        <div className="flex-1 relative group bg-zinc-950">
            {/* Locked Overlay */}
            {isLockedByOther && (
                <div className="absolute inset-0 z-30 bg-zinc-950/40 backdrop-blur-[1px] flex items-center justify-center p-6 text-center">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                            <Lock size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-zinc-100 font-bold">편집 중인 사용자가 있습니다</h3>
                            <p className="text-zinc-500 text-sm">현재 다른 편집자가 작업 중입니다. 잠시만 기다려주세요.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay Info */}
            <div className="absolute top-0 left-0 text-[10px] text-zinc-500 pointer-events-none select-none flex gap-4 uppercase z-20 backdrop-blur-md bg-zinc-950/50 p-2 pr-4 rounded-br-xl border-b border-r border-zinc-800/50">
                <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    {role}
                </span>
                <span className="opacity-50">LEN: {content.length}</span>
            </div>

            {/* 주석 하이라이팅 및 링크 감지 오버레이 */}
            <div
                ref={highlightRef}
                className="absolute inset-0 p-8 pt-16 overflow-hidden pointer-events-none font-mono text-lg leading-relaxed whitespace-pre-wrap break-words"
            >
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
                                                className="text-blue-400 underline hover:text-blue-300 pointer-events-auto cursor-pointer relative z-10"
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
                onScroll={handleScroll}
                className={`relative w-full h-full p-8 pt-16 bg-transparent text-zinc-100/0 text-lg resize-none outline-none font-mono leading-relaxed caret-zinc-100 selection:bg-blue-500/30 selection:text-zinc-100 ${(role !== "editor" || isLockedByOther) ? "cursor-default" : ""}`}
                spellCheck={false}
                value={content}
                onChange={onContentChange}
                readOnly={role !== "editor" || isLockedByOther}
                placeholder={isLockedByOther ? "다른 사용자가 편집 중입니다..." : (role === "editor" ? "Type or paste content here..." : "Permission denied (Read-only).")}
                style={{ color: 'transparent', caretColor: isLockedByOther ? 'transparent' : '#f4f4f5' }}
            />

        </div>
    );
}
