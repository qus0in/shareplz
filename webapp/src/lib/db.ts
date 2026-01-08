import { getRequestContext } from "@cloudflare/next-on-pages";

export interface RoomData {
    id: string;
    content: string;
    edit_pin: string;
    read_pin: string | null;
    created_at: string;
}

export const getDB = () => {
    return getRequestContext().env.DB;
};

/**
 * 룸 정보를 가져옵니다.
 */
export async function getRoom(id: string): Promise<RoomData | null> {
    const db = getDB();
    const result = await db
        .prepare("SELECT * FROM rooms WHERE id = ?")
        .bind(id)
        .first<RoomData>();
    return result;
}

/**
 * 새로운 룸을 생성합니다.
 */
export async function createRoom(id: string, editPin: string, readPin: string | null): Promise<boolean> {
    const db = getDB();
    await db
        .prepare("INSERT INTO rooms (id, edit_pin, read_pin) VALUES (?, ?, ?)")
        .bind(id, editPin, readPin)
        .run();
    return true;
}

/**
 * 콘텐츠를 업데이트합니다.
 */
export async function updateContent(id: string, content: string): Promise<boolean> {
    const db = getDB();
    await db
        .prepare("UPDATE rooms SET content = ? WHERE id = ?")
        .bind(content, id)
        .run();
    return true;
}

/**
 * 룸을 삭제합니다.
 */
export async function deleteRoom(id: string): Promise<boolean> {
    const db = getDB();
    await db
        .prepare("DELETE FROM rooms WHERE id = ?")
        .bind(id)
        .run();
    return true;
}

