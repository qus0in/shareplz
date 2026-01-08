import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface AccessProtectedProps {
    pin: string;
    setPin: (pin: string) => void;
    onAuth: () => void;
}

/**
 * 비밀번호 입력 화면 컴포넌트
 */
export function AccessProtected({ pin, setPin, onAuth }: AccessProtectedProps) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950">
            <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <Lock className="mx-auto mb-4 text-zinc-500" size={32} />
                    <CardTitle className="text-zinc-100 text-lg uppercase tracking-widest font-bold">
                        Access Protected
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-zinc-500 text-[10px] text-center font-mono uppercase tracking-tighter">
                        열람을 위해 숫자 6자리 PIN을 입력하세요.
                    </p>
                    <Input
                        type="password"
                        maxLength={6}
                        placeholder="숫자 6자리"
                        className="bg-zinc-950 border-zinc-800 text-center text-xl tracking-[0.5em] text-zinc-100 h-14"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                        onKeyDown={(e) => e.key === 'Enter' && onAuth()}
                    />
                    <Button
                        className="w-full h-12 bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-bold"
                        onClick={onAuth}
                    >
                        UNLOCK ROOM
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
