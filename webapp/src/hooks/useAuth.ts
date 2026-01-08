import { useState, useEffect } from "react";
import { toast } from "sonner";

/**
 * 비밀번호 인증 및 자동 로그인을 관리하는 커스텀 훅
 */
export function useAuth(id: string, role: string, loading: boolean, setRole: (role: "none" | "viewer" | "editor") => void) {
    const [pin, setPin] = useState("");

    // 비밀번호 확인
    const handleAuth = async (pinToTry?: string) => {
        const authPin = pinToTry || pin;
        if (!authPin) return;

        try {
            const res = await fetch(`/api/room/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin: authPin }),
            });

            if (res.ok) {
                const data = await res.json() as { authorized: boolean; role: "editor" | "viewer" };
                setRole(data.role);

                // SessionStorage에 PIN 저장
                sessionStorage.setItem(`room_${id}_pin`, authPin);

                if (!pinToTry) {
                    toast.success(data.role === "editor" ? "편집 권한 획득!" : "읽기 권한 획득!");
                }
                setPin("");
            } else {
                if (!pinToTry) {
                    toast.error("비밀번호가 올바르지 않습니다.");
                    setPin("");
                }
            }
        } catch (e) {
            if (!pinToTry) {
                toast.error("인증 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        }
    };

    // 자동 로그인 시도
    useEffect(() => {
        if (role === "none" && !loading) {
            const savedPin = sessionStorage.getItem(`room_${id}_pin`);
            if (savedPin) {
                handleAuth(savedPin);
            }
        }
    }, [role, loading, id]);

    return { pin, setPin, handleAuth };
}
