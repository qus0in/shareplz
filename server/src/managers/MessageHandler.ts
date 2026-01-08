import { DataManager } from "./DataManager";
import { ConnectionManager } from "./ConnectionManager";

export class MessageHandler {
    private dataManager: DataManager;
    private connectionManager: ConnectionManager;

    constructor(dataManager: DataManager, connectionManager: ConnectionManager) {
        this.dataManager = dataManager;
        this.connectionManager = connectionManager;
    }

    async handle(
        ws: WebSocket,
        message: string | ArrayBuffer,
        storage: DurableObjectStorage,
        sockets: WebSocket[],
        updateContent: (content: string) => void
    ): Promise<void> {
        try {
            const data = JSON.parse(message as string);
            if (data.type === "update") {
                const content = data.content;
                updateContent(content);

                // 저장
                await this.dataManager.saveContent(storage, content);

                // 브로드캐스트
                this.connectionManager.broadcast(sockets, JSON.stringify({ type: "update", content }), ws);

                // 백업 스케줄링
                await this.dataManager.scheduleBackup(storage);
            }
        } catch (e) {
            console.error("WebSocket message error:", e);
        }
    }
}
