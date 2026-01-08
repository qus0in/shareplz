import { Share2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface EditorHeaderProps {
    id: string;
    role: "viewer" | "editor";
    status: "connecting" | "connected" | "disconnected";
    isEditing: boolean;
    pin: string;
    content: string;
    setPin: (pin: string) => void;
    onAuth: () => void;
}

export function EditorHeader({ id, role, status, isEditing, pin, content, setPin, onAuth }: EditorHeaderProps) {
    return (
        <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
                <h1 className="text-sm font-bold text-white tracking-tighter flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 hover:text-zinc-300 transition-colors">
                        <Share2 size={14} className="text-blue-500" />
                        SHAREPLZ
                    </Link>
                    / <span className="text-zinc-500 font-normal">{id}</span>
                </h1>
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
                    <div className={`w-1.5 h-1.5 rounded-full ${isEditing ? 'bg-blue-500 animate-pulse' : (status === 'connected' ? 'bg-green-500' : 'bg-red-500')}`}></div>
                    <span className={`text-[10px] uppercase tracking-tighter ${isEditing ? 'text-blue-500' : 'text-zinc-500'}`}>
                        {isEditing ? 'editing' : status}
                    </span>
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
                            placeholder="PIN"
                            className="h-8 w-20 bg-zinc-900 border-zinc-800 text-[10px] text-center focus:w-32 transition-all placeholder:text-zinc-700 text-zinc-300"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                            onKeyDown={(e) => e.key === 'Enter' && onAuth()}
                        />
                        <Edit3 size={10} className="absolute right-2 top-2.5 text-zinc-600 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                )}
                <div className="flex bg-zinc-900 rounded-md border border-zinc-800 overflow-hidden">
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-none border-r border-zinc-800 px-3" onClick={() => {
                        navigator.clipboard.writeText(content);
                        toast.success("전체 내용 복사 완료");
                    }}>
                        COPY ALL
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-none px-3" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("링크 복사 완료");
                    }}>
                        SHARE LINK
                    </Button>
                </div>
            </div>
        </header>
    );
}
