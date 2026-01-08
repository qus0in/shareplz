import { NextResponse } from "next/server";
import { getRoom, updateContent } from "@/lib/db";

export const runtime = "edge";

/**
 * 방 정보를 가져옵니다.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const room = await getRoom(id);

    if (!room) {
        return NextResponse.json({ error: "존재하지 않는 방입니다." }, { status: 404 });
    }

    // 읽기 비밀번호가 설정되어 있는지 확인
    const requiresReadAuth = !!room.read_pin;

    return NextResponse.json({
        id: room.id,
        content: requiresReadAuth ? null : room.content, // 읽기 권한 필요시 내용 숨김
        requiresReadAuth,
        created_at: room.created_at,
    });
}

/**
 * 비밀번호 확인 및 권한 획득
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json() as { pin: string };
    const { pin } = body;

    const room = await getRoom(id);

    if (!room) {
        return NextResponse.json({ error: "존재하지 않는 방입니다." }, { status: 404 });
    }

    if (room.edit_pin === pin) {
        return NextResponse.json({ authorized: true, role: "editor" });
    }

    if (room.read_pin === pin) {
        return NextResponse.json({ authorized: true, role: "viewer" });
    }

    return NextResponse.json({ authorized: false }, { status: 401 });
}

/**
 * 콘텐츠 업데이트 (편집 권한 확인 포함)
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json() as { content: string; pin: string };
    const { content, pin } = body;

    const room = await getRoom(id);

    if (!room || room.edit_pin !== pin) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    await updateContent(id, content);
    return NextResponse.json({ success: true });
}
