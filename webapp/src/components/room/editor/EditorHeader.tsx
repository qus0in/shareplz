"use client";

import { Share2, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

/**
 * 에디터 상단 헤더 컴포넌트
 */
export function EditorHeader({ id, role, status, isEditing, pin, content, setPin, onAuth }: EditorHeaderProps) {
    const router = useRouter();

    /**
     * 방 삭제 처리
     */
    const handleDelete = async () => {
        if (!confirm("정말로 이 방을 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.")) {
            return;
        }

        try {
            const savedPin = sessionStorage.getItem(`room_${id}_pin`) || pin;

            const res = await fetch(`/api/room/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: savedPin }),
            });

            if (res.ok) {
                toast.success("방이 성공적으로 삭제되었습니다.");
                router.push("/");
            } else {
                const data = await res.json() as { error: string };
                toast.error(data.error || "삭제에 실패했습니다.");
            }
        } catch (error) {
            toast.error("삭제 요청 중 오류가 발생했습니다.");
        }
    };

    return (
        <header className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-2 sm:gap-4">
                <h1 className="text-sm font-bold text-white tracking-tighter flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2 hover:text-zinc-300 transition-colors shrink-0">
                        <Share2 size={14} className="text-blue-500" />
                        <span className="hidden sm:inline">SHAREPLZ</span>
                    </Link>
                    <span className="text-zinc-800 hidden xs:inline">/</span>
                    <span className="text-zinc-500 font-normal truncate max-w-[50px] xs:max-w-[80px] sm:max-w-none">{id}</span>
                </h1>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${isEditing ? 'bg-blue-500 animate-pulse' : (status === 'connected' ? 'bg-green-500' : 'bg-red-500')}`}></div>
                    <span className={`text-[9px] sm:text-[10px] uppercase tracking-tighter ${isEditing ? 'text-blue-500' : 'text-zinc-500'}`}>
                        <span className="hidden xs:inline">{isEditing ? 'editing' : status}</span>
                        {!isEditing && <span className="xs:hidden">{status === 'connected' ? 'ON' : 'OFF'}</span>}
                    </span>
                </div>

                {role === "editor" && (
                    <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                        <ShieldCheck size={10} />
                        <span className="text-[10px] uppercase font-bold tracking-tighter">Editor</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
                {role === "viewer" && (
                    <Input
                        type="password"
                        maxLength={6}
                        placeholder="PIN"
                        className="h-7 sm:h-8 w-14 xs:w-16 sm:w-20 bg-zinc-900 border-zinc-800 text-[10px] text-center focus:w-20 xs:focus:w-24 sm:focus:w-32 transition-all placeholder:text-zinc-700 text-zinc-300"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                        onKeyDown={(e) => e.key === 'Enter' && onAuth()}
                    />
                )}

                <div className="flex bg-zinc-900 rounded-md border border-zinc-800 overflow-hidden shrink-0">
                    {role === "editor" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 sm:h-8 text-[10px] text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-none border-r border-zinc-800 px-2 sm:px-3 flex items-center gap-1.5"
                            onClick={handleDelete}
                        >
                            <Trash2 size={10} />
                            <span className="hidden sm:inline">DELETE</span>
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-none border-r border-zinc-800 px-2 sm:px-3" onClick={() => {
                        navigator.clipboard.writeText(content);
                        toast.success("전체 내용 복사 완료");
                    }}>
                        <span className="sm:hidden">COPY</span>
                        <span className="hidden sm:inline">COPY ALL</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-none px-2 sm:px-3" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("링크 복사 완료");
                    }}>
                        <span className="sm:hidden">SHARE</span>
                        <span className="hidden sm:inline">SHARE LINK</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
