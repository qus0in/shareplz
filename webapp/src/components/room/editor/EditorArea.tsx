import { useRef } from "react";

interface EditorAreaProps {
    role: "viewer" | "editor";
    content: string;
    onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function EditorArea({ role, content, onContentChange }: EditorAreaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div className="flex-1 relative group">
            {/* Overlay Info */}
            <div className="absolute top-4 left-6 text-[9px] text-zinc-800 pointer-events-none select-none flex gap-4 uppercase z-10 transition-opacity opacity-50 group-hover:opacity-100">
                <span>$ ROLE: {role}</span>
                <span>$ LEN: {content.length}</span>
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
                className={`relative w-full h-full p-8 pt-12 bg-transparent text-zinc-100/0 text-lg resize-none outline-none font-mono leading-relaxed caret-zinc-100 selection:bg-blue-500/30 selection:text-zinc-100 ${role !== "editor" ? "cursor-default pointer-events-none" : ""}`}
                spellCheck={false}
                value={content}
                onChange={onContentChange}
                readOnly={role !== "editor"}
                placeholder={role === "editor" ? "Type or paste content here..." : "Permission denied (Read-only)."}
                style={{ color: 'transparent', caretColor: '#f4f4f5' }}
            />
        </div>
    );
}
