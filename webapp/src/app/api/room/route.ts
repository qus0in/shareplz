import { NextResponse } from "next/server";
import { createRoom } from "@/lib/db";
import { nanoid } from "nanoid";

export const runtime = "edge";

/**
 * 새로운 공유방을 생성합니다.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json() as { editPin: string; readPin?: string };
        const { editPin, readPin } = body;

        if (!editPin || editPin.length !== 6) {
            return NextResponse.json({ error: "편집용 비밀번호 6자리가 필요합니다." }, { status: 400 });
        }

        // 단축 UUID 생성
        const id = nanoid(10);

        await createRoom(id, editPin, readPin || null);

        return NextResponse.json({ id });
    } catch (e) {
        console.error("Room creation error:", e);
        return NextResponse.json({ error: "방 생성 중 오류가 발생했습니다." }, { status: 500 });
    }
}
