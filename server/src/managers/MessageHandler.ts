import { DataManager } from "./DataManager";
import { ConnectionManager } from "./ConnectionManager";
import { SharePlzSession } from "../SharePlzSession";

export class MessageHandler {
    private dataManager: DataManager;
    private connectionManager: ConnectionManager;
    private lockTimeout: any = null;

    constructor(dataManager: DataManager, connectionManager: ConnectionManager) {
        this.dataManager = dataManager;
        this.connectionManager = connectionManager;
    }

    async handle(
        ws: WebSocket,
        message: string | ArrayBuffer,
        session: SharePlzSession,
        storage: DurableObjectStorage,
        sockets: WebSocket[],
        updateContent: (content: string) => void
    ): Promise<void> {
        try {
            const data = JSON.parse(message as string);

            // 1. 편집 시작 시도
            if (data.type === "editing_start") {
                if (session.activeEditor && session.activeEditor !== ws) {
                    // 이미 다른 사람이 편집 중임
                    ws.send(JSON.stringify({ type: "lock_failed", reason: "다른 사용자가 편집 중입니다." }));
                    return;
                }

                session.activeEditor = ws;
                this.connectionManager.broadcast(sockets, JSON.stringify({ type: "lock_acquired", userId: data.userId || "Someone" }), ws);

                // 타임아웃 설정 (3초간 활동 없으면 잠금 해제)
                this.resetLockTimeout(session, sockets);
                return;
            }

            // 2. 콘텐츠 업데이트
            if (data.type === "update") {
                // 잠금 소유자 확인
                if (session.activeEditor && session.activeEditor !== ws) {
                    return; // 권한 없음
                }

                // 잠금 소유자가 아니더라도 첫 업데이트라면 잠금 획득 시도 (하위호환성)
                if (!session.activeEditor) {
                    session.activeEditor = ws;
                    this.connectionManager.broadcast(sockets, JSON.stringify({ type: "lock_acquired", userId: data.userId || "Someone" }), ws);
                }

                const content = data.content;
                updateContent(content);

                // 저장 및 브로드캐스트
                await this.dataManager.saveContent(storage, content);
                this.connectionManager.broadcast(sockets, JSON.stringify({ type: "update", content }), ws);

                // 타임아웃 갱신
                this.resetLockTimeout(session, sockets);

                // 백업 스케줄링
                await this.dataManager.scheduleBackup(storage);
            }
        } catch (e) {
            console.error("WebSocket message error:", e);
        }
    }

    private resetLockTimeout(session: SharePlzSession, sockets: WebSocket[]) {
        if (this.lockTimeout) clearTimeout(this.lockTimeout);

        this.lockTimeout = setTimeout(() => {
            if (session.activeEditor) {
                session.activeEditor = null;
                this.connectionManager.broadcast(sockets, JSON.stringify({ type: "lock_released" }));
            }
        }, 3000); // 3초간 입력 없으면 잠금 해제
    }
}

