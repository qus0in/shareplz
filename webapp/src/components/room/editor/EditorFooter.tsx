import { Github, Twitter } from "lucide-react";
import { CheckCircle2 } from "lucide-react";

interface EditorFooterProps {
    content: string;
    status: "connecting" | "connected" | "disconnected";
}

export function EditorFooter({ content, status }: EditorFooterProps) {
    return (
        <footer className="px-4 sm:px-6 py-1.5 border-t border-zinc-900 bg-zinc-950 flex justify-between items-center text-[9px] text-zinc-700 uppercase tracking-tight">
            <div className="flex gap-2 sm:gap-4 overflow-hidden truncate">
                <span className="hidden xs:inline">UTF-8 / NO_WRAP</span>
                <span>SIZE: {new Blob([content]).size}B</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
                <a
                    href="https://github.com/qus0in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-zinc-500 transition-colors"
                >
                    <Github size={10} />
                    <span className="hidden sm:inline">@qus0in</span>
                </a>
                <a
                    href="https://x.com/qus0in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-zinc-500 transition-colors"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-2.5 h-2.5 fill-current">
                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                    <span className="hidden sm:inline">@qus0in</span>
                </a>
            </div>
        </footer>
    );
}
