import { DurableObject } from "cloudflare:workers";

interface Env {
    ROOM: DurableObjectNamespace<Room>;
    DB: D1Database;
}

/**
 * 실시간 협업을 위한 룸 Durable Object
 */
export class Room extends DurableObject {
    private sessions: Set<WebSocket> = new Set();
    private content: string = "";
    private roomId: string = "";
    private dbEnv: Env;
    private saveTimer: number | null = null;

    constructor(state: DurableObjectState, env: Env) {
        super(state, env);
        this.dbEnv = env;

        // 저장된 상태 복구
        this.ctx.blockConcurrencyWhile(async () => {
            this.content = (await this.ctx.storage.get<string>("content")) || "";
            this.roomId = (await this.ctx.storage.get<string>("roomId")) || "";
        });
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const roomId = url.searchParams.get("roomId");

        if (roomId && !this.roomId) {
            this.roomId = roomId;
            await this.ctx.storage.put("roomId", roomId);
        }

        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader !== "websocket") {
            // WebSocket이 아닌 경우 현재 콘텐츠 반환
            return new Response(JSON.stringify({ content: this.content }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        const pair = new WebSocketPair();
        const client = pair[0];
        const server = pair[1];

        await this.handleSession(server);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    private async handleSession(ws: WebSocket) {
        ws.accept();
        this.sessions.add(ws);

        // 초기 콘텐츠 전송
        ws.send(JSON.stringify({ type: "init", content: this.content }));

        ws.addEventListener("message", async (msg) => {
            try {
                const data = JSON.parse(msg.data as string);
                if (data.type === "update") {
                    this.content = data.content;

                    // Durable Object Storage에 즉시 저장
                    await this.ctx.storage.put("content", this.content);

                    // 다른 클라이언트에게 전송
                    this.broadcast(JSON.stringify({ type: "update", content: this.content }), ws);

                    // D1 백업 예약 (디바운스: 3초 후 저장)
                    this.scheduleD1Backup();
                }
            } catch (e) {
                console.error("WebSocket message error:", e);
            }
        });

        ws.addEventListener("close", () => {
            this.sessions.delete(ws);
        });
    }

    private broadcast(message: string, sender?: WebSocket) {
        for (const session of this.sessions) {
            if (session !== sender) {
                try {
                    session.send(message);
                } catch (e) {
                    this.sessions.delete(session);
                }
            }
        }
    }

    /**
     * D1 백업을 디바운스 처리하여 예약합니다.
     * 마지막 업데이트 후 3초 뒤에 실행됩니다.
     */
    private scheduleD1Backup() {
        if (this.saveTimer !== null) {
            clearTimeout(this.saveTimer);
        }

        this.saveTimer = setTimeout(async () => {
            await this.saveToD1();
            this.saveTimer = null;
        }, 3000) as unknown as number;
    }

    /**
     * 현재 콘텐츠를 D1 데이터베이스에 백업합니다.
     */
    private async saveToD1() {
        if (!this.roomId) return;

        try {
            await this.dbEnv.DB
                .prepare("UPDATE rooms SET content = ? WHERE id = ?")
                .bind(this.content, this.roomId)
                .run();

            console.log(`[DO] Saved to D1: room=${this.roomId}, size=${this.content.length}`);
        } catch (e) {
            console.error("[DO] D1 backup error:", e);
        }
    }
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const roomId = url.searchParams.get("roomId");

        if (!roomId) {
            return new Response("Room ID required", { status: 400 });
        }

        const id = env.ROOM.idFromName(roomId);
        const obj = env.ROOM.get(id);

        return obj.fetch(request);
    },
};
