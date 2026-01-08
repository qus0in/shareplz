import { DurableObject } from "cloudflare:workers";

interface Env {
    NEW_ROOM: DurableObjectNamespace<SharePlzSession>;
    DB: D1Database;
}

/**
 * 실시간 협업을 위한 룸 Durable Object (SharePlzSession)
 */
export class SharePlzSession extends DurableObject {
    private content: string = "";
    private roomId: string = "";
    private dbEnv: Env;
    private lastSaveTime: number = 0;

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
        try {
            const url = new URL(request.url);
            const roomId = url.searchParams.get("roomId");
            console.log(`[DO] Fetch received. Room: ${roomId}, URL: ${request.url}`);

            if (roomId && !this.roomId) {
                this.roomId = roomId;
                await this.ctx.storage.put("roomId", roomId);
            }

            const upgradeHeader = request.headers.get("Upgrade");
            console.log(`[DO] Upgrade Header: ${upgradeHeader}`);

            if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
                return new Response(JSON.stringify({ content: this.content }), {
                    headers: { "Content-Type": "application/json" },
                });
            }

            const pair = new WebSocketPair();
            const client = pair[0];
            const server = pair[1];

            this.ctx.acceptWebSocket(server);
            console.log(`[DO] WebSocket accepted for room: ${roomId}`);

            // 연결 즉시 초기 데이터 전송
            server.send(JSON.stringify({ type: "init", content: this.content }));

            return new Response(null, {
                status: 101,
                webSocket: client,
            });
        } catch (error) {
            console.error(`[DO] Error in fetch:`, error);
            // WebSocket 핸드셰이크 요청에 대해서는 500을 명확히 반환
            return new Response(`Internal Server Error: ${error}`, { status: 500 });
        }
    }

    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
        try {
            const data = JSON.parse(message as string);
            if (data.type === "update") {
                this.content = data.content;

                // DO 메모리/스토리지 업데이트 (가장 빠름)
                await this.ctx.storage.put("content", this.content);

                // 브로드캐스트 (자신 제외)
                this.broadcast(JSON.stringify({ type: "update", content: this.content }), ws);

                // D1 저장은 Alarm으로 위임하여 부하 분산 (즉시 저장 X)
                const currentAlarm = await this.ctx.storage.getAlarm();
                if (currentAlarm == null) {
                    // 10초 뒤에 저장 (배칭 효과)
                    await this.ctx.storage.setAlarm(Date.now() + 10000);
                }
            }
        } catch (e) {
            console.error("WebSocket message error:", e);
        }
    }

    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
        // Hibernation 자동 관리
    }

    async webSocketError(ws: WebSocket, error: any) {
        console.error("WebSocket error:", error);
    }

    private broadcast(message: string, sender?: WebSocket) {
        for (const session of this.ctx.getWebSockets()) {
            if (session !== sender) {
                try {
                    session.send(message);
                } catch (e) {
                    // Hibernation API 관리
                }
            }
        }
    }

    async alarm() {
        await this.saveToD1();
    }

    private async saveToD1() {
        if (!this.roomId) return;
        // 빈 내용이거나 변경사항이 없으면 스킵 로직 추가 가능하지만 단순화 유지
        try {
            await this.dbEnv.DB
                .prepare("UPDATE rooms SET content = ? WHERE id = ?")
                .bind(this.content, this.roomId)
                .run();
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

        const id = env.NEW_ROOM.idFromName(roomId);
        const obj = env.NEW_ROOM.get(id);

        return obj.fetch(request);
    },
};

export class Room extends DurableObject { }
export class ProjectAlpha extends DurableObject { }
