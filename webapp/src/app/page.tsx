"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Terminal, Lock, Plus, Eye } from "lucide-react";

export default function Home() {
  const [editPin, setEditPin] = useState("");
  const [readPin, setReadPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async () => {
    if (editPin.length !== 6) {
      toast.error("편집용 비밀번호 6자리를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editPin, readPin }),
      });

      const data = await res.json() as { id: string; error?: string };
      if (res.ok) {
        toast.success("방이 생성되었습니다!");
        router.push(`/${data.id}`);
      } else {
        toast.error(data.error || "알 수 없는 오류");
      }
    } catch (e) {
      toast.error("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl text-zinc-100 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-zinc-800 text-blue-400">
              <Terminal size={20} />
            </div>
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">SharePlz System</span>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">새로운 공유방</CardTitle>
          <CardDescription className="text-zinc-400">
            편집 권한과 읽기 권한을 설정하세요.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
              <Lock size={12} className="text-blue-500" />
              편집용 비밀번호 (숫자 6자리)
            </label>
            <Input
              type="password"
              maxLength={6}
              placeholder="숫자 6자리 고정"
              className="bg-zinc-950 border-zinc-800 text-center text-xl tracking-widest focus:ring-blue-500 h-12"
              value={editPin}
              onChange={(e) => setEditPin(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
              <Eye size={12} className="text-zinc-500" />
              읽기용 비밀번호 (숫자 6자리)
            </label>
            <Input
              type="password"
              maxLength={6}
              placeholder="설정 시 숫자 6자리 필수"
              className="bg-zinc-950 border-zinc-800 text-center text-xl tracking-widest focus:ring-zinc-700 h-12"
              value={readPin}
              onChange={(e) => setReadPin(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>

          <Button
            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500 transition-all text-white flex gap-2 shadow-lg shadow-blue-500/20"
            onClick={handleCreateRoom}
            disabled={loading || editPin.length !== 6}
          >
            {loading ? "생성 중..." : (
              <>
                <Plus size={20} />
                방 생성하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <footer className="mt-8 text-zinc-600 text-[10px] font-mono tracking-tighter uppercase flex items-center gap-4">
        <a
          href="https://github.com/qus0in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-zinc-500 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          <span>@qus0in</span>
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
          <span>@qus0in</span>
        </a>
      </footer>
    </main>
  );
}
