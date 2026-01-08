import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCreateRoom() {
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

    return {
        editPin,
        setEditPin,
        readPin,
        setReadPin,
        loading,
        handleCreateRoom
    };
}
