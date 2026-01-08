"use client";

import { useCreateRoom } from "@/hooks/useCreateRoom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Lock, Plus, Eye } from "lucide-react";

export function CreateRoomForm() {
    const {
        editPin,
        setEditPin,
        readPin,
        setReadPin,
        loading,
        handleCreateRoom
    } = useCreateRoom();

    return (
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
    );
}
