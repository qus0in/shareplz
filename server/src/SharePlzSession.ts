import { DurableObject } from "cloudflare:workers";
import { Env } from "./index";
import { getCorsHeaders, isOriginAllowed } from "./utils";
import { DataManager } from "./managers/DataManager";
import { ConnectionManager } from "./managers/ConnectionManager";
import { MessageHandler } from "./managers/MessageHandler";

/**
 * 실시간 협업을 위한 룸 Durable Object (SharePlzSession)
 */
export class SharePlzSession extends DurableObject {
    public content: string = "";
    private roomId: string = "";
    private dbEnv: Env;

    private dataManager: DataManager;
    private connectionManager: ConnectionManager;
    private messageHandler: MessageHandler;

    // 현재 편집 중인 사용자의 소켓 (잠금 매커니즘)
    public activeEditor: WebSocket | null = null;
    private lockTimeout: any = null;

    constructor(state: DurableObjectState, env: Env) {

        super(state, env);
        this.dbEnv = env;

        this.dataManager = new DataManager();
        this.connectionManager = new ConnectionManager();
        this.messageHandler = new MessageHandler(this.dataManager, this.connectionManager);

        // 저장된 상태 복구
        this.ctx.blockConcurrencyWhile(async () => {
            this.content = (await this.ctx.storage.get<string>("content")) || "";
            this.roomId = (await this.ctx.storage.get<string>("roomId")) || "";
        });
    }

    async fetch(request: Request): Promise<Response> {
        try {
            const corsHeaders = getCorsHeaders(request, this.dbEnv);

            if (request.method === "OPTIONS") {
                return new Response(null, { headers: corsHeaders });
            }

            if (!isOriginAllowed(request, this.dbEnv)) {
                return new Response("Forbidden", { status: 403 });
            }

            const url = new URL(request.url);
            const roomId = url.searchParams.get("roomId");
            console.log(`[DO] Fetch received. Room: ${roomId}, URL: ${request.url}`);

            if (roomId && !this.roomId) {
                this.roomId = roomId;
                await this.ctx.storage.put("roomId", roomId);
            }

            const upgradeHeader = request.headers.get("Upgrade");

            if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
                return new Response(JSON.stringify({ content: this.content }), {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json"
                    },
                });
            }

            const pair = new WebSocketPair();
            const client = pair[0];
            const server = pair[1];

            this.connectionManager.acceptWebSocket(this.ctx, server, roomId || "unknown");

            // 연결 즉시 초기 데이터 전송
            server.send(JSON.stringify({ type: "init", content: this.content }));

            return new Response(null, {
                status: 101,
                webSocket: client,
                headers: corsHeaders,
            });
        } catch (error) {
            console.error(`[DO] Error in fetch:`, error);
            const corsHeaders = getCorsHeaders(request, this.dbEnv);

            return new Response(`Internal Server Error: ${error}`, {
                status: 500,
                headers: corsHeaders
            });
        }
    }

    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
        await this.messageHandler.handle(
            ws,
            message,
            this, // 세션 인스턴스 전달 (Lock 관리용)
            this.ctx.storage,
            this.ctx.getWebSockets(),
            (newContent) => {
                this.content = newContent;
            }
        );
    }

    async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
        // 편집 중이던 사용자가 나가면 잠금 해제
        if (this.activeEditor === ws) {
            this.activeEditor = null;
            if (this.lockTimeout) clearTimeout(this.lockTimeout);

            // 모든 클라이언트에게 편집 가능 상태 알림
            const sockets = this.ctx.getWebSockets();
            this.connectionManager.broadcast(sockets, JSON.stringify({ type: "lock_released" }));
        }
    }

    async webSocketError(ws: WebSocket, error: any) {
        console.error("WebSocket error:", error);
    }

    async alarm() {
        await this.dataManager.backupToD1(this.content, this.roomId, this.dbEnv.DB);
    }
}
