import { NextResponse } from "next/server";
import { getRoom, updateContent, deleteRoom } from "@/lib/db";

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

/**
 * 방을 삭제합니다 (편집 권한 필요)
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: roomId } = await params;
    const body = await request.json() as { pin: string };
    const { pin } = body;

    const room = await getRoom(roomId);

    if (!room || room.edit_pin !== pin) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 1. D1 데이터베이스에서 삭제
    await deleteRoom(roomId);

    // 2. Durable Object 상태 삭제 및 인스턴스 종료 요청
    // Webapp의 바인딩을 사용하지 않고 서버 워커의 엔드포인트를 호출합니다.
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://shareplz-server.qus0in.workers.dev";

    try {
        await fetch(`${serverUrl}/api/room?roomId=${roomId}`, {
            method: "DELETE"
        });
    } catch (error) {
        console.error("Failed to notify DO about deletion:", error);
    }

    return NextResponse.json({ success: true });
}
