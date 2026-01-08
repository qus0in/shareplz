"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Share2, Edit3, CheckCircle2, ShieldCheck } from "lucide-react";

export default function RoomPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();

    const [role, setRole] = useState<"none" | "viewer" | "editor">("none");
    const [pin, setPin] = useState("");
    const [content, setContent] = useState("");
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
    const [requiresReadAuth, setRequiresReadAuth] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 초기 데이터 로드 (D1)
    const fetchRoom = useCallback(async () => {
        try {
            const res = await fetch(`/api/room/${id}`);
            if (res.ok) {
                const data = await res.json() as { content: string | null; requiresReadAuth: boolean };
                setRequiresReadAuth(data.requiresReadAuth);

                if (!data.requiresReadAuth) {
                    setRole("viewer");
                    setContent(data.content || "");
                }
                setLoading(false);
            } else {
                toast.error("방을 찾을 수 없습니다.");
                router.push("/");
            }
        } catch (e) {
            console.error("Fetch room error:", e);
        }
    }, [id, router]);

    useEffect(() => {
        fetchRoom();
    }, [fetchRoom]);

    // WebSocket 연결 (Durable Object)
    useEffect(() => {
        if (role === "none") return;

        setStatus("connecting");
        const socket = new WebSocket(`wss://shareplz-server.qus0in.workers.dev?roomId=${id}`);

        socket.onopen = () => {
            setStatus("connected");
            if (role === "editor") toast.success("편집 모드 활성화");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data) as { type: string; content?: string };
            if (data.type === "init") {
                if (data.content !== undefined && !content) setContent(data.content);
            } else if (data.type === "update" && data.content !== undefined) {
                setContent(data.content);
            }
        };

        socket.onclose = () => setStatus("disconnected");
        setWs(socket);

        return () => socket.close();
    }, [id, role]);

    // 내용 변경 핸들러 (편집자 전용)
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (role !== "editor") return;

        const newContent = e.target.value;
        setContent(newContent);

        // WebSocket으로 전송 (Durable Object가 자동으로 D1에 백업)
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "update", content: newContent }));
        }
    };

    // 비밀번호 확인 (읽기 또는 편집 권한 확인)
    const handleAuth = async () => {
        try {
            const res = await fetch(`/api/room/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin }),
            });

            if (res.ok) {
                const data = await res.json() as { authorized: boolean; role: "editor" | "viewer" };
                setRole(data.role);
                toast.success(data.role === "editor" ? "편집 권한 획득!" : "읽기 권한 획득!");
                setPin("");
            } else {
                toast.error("비밀번호가 올바르지 않습니다.");
                setPin("");
            }
        } catch (e) {
            toast.error("인증 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-blue-500 font-mono text-sm tracking-tighter">
                <div className="animate-pulse">_INITIALIZING_SYSTEM_BUFFER...</div>
            </div>
        );
    }

    // 읽기 권한조차 없는 경우
    if (role === "none" && requiresReadAuth) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950">
                <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <Lock className="mx-auto mb-4 text-zinc-500" size={32} />
                        <CardTitle className="text-zinc-100 text-lg uppercase tracking-widest font-bold">Access Protected</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-zinc-500 text-[10px] text-center font-mono uppercase tracking-tighter">열람을 위해 숫자 6자리 PIN을 입력하세요.</p>
                        <Input
                            type="password"
                            maxLength={6}
                            placeholder="숫자 6자리"
                            className="bg-zinc-950 border-zinc-800 text-center text-xl tracking-[0.5em] text-zinc-100 h-14"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                        />
                        <Button className="w-full h-12 bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-bold" onClick={handleAuth}>
                            UNLOCK ROOM
                        </Button>
                    </CardContent>
                </Card>
            </main>
        );
    }

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
                                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
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

            {/* Editor Area with Syntax Highlighting Overlay */}
            <div className="flex-1 relative">
                <div className="absolute top-4 left-6 text-[9px] text-zinc-800 pointer-events-none select-none flex gap-4 uppercase z-10">
                    <span>$ ROLE: {role}</span>
                    <span>$ ROOM_ID: {id}</span>
                </div>

                {/* 주석 하이라이팅 오버레이 */}
                <div className="absolute inset-0 p-8 pt-12 overflow-hidden pointer-events-none font-mono text-lg leading-relaxed whitespace-pre-wrap break-words">
                    {content.split('\n').map((line, idx) => {
                        const isComment = line.trim().startsWith('#') || line.trim().startsWith('//');
                        return (
                            <div key={idx} className={isComment ? 'text-zinc-600 italic' : 'text-zinc-100'}>
                                {line || '\u00A0'}
                            </div>
                        );
                    })}
                </div>

                {/* 실제 입력 textarea */}
                <textarea
                    ref={textareaRef}
                    className={`relative w-full h-full p-8 pt-12 bg-transparent text-zinc-100 text-lg resize-none outline-none font-mono leading-relaxed caret-zinc-100 ${role !== "editor" ? "cursor-not-allowed" : ""}`}
                    spellCheck={false}
                    value={content}
                    onChange={handleContentChange}
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
