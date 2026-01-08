export class DataManager {
    async saveContent(storage: DurableObjectStorage, content: string) {
        // DO 메모리/스토리지 업데이트 (가장 빠름)
        await storage.put("content", content);
    }

    async scheduleBackup(storage: DurableObjectStorage) {
        // D1 저장은 Alarm으로 위임하여 부하 분산 (즉시 저장 X)
        const currentAlarm = await storage.getAlarm();
        if (currentAlarm == null) {
            // 10초 뒤에 저장 (배칭 효과)
            await storage.setAlarm(Date.now() + 10000);
        }
    }

    async backupToD1(content: string, roomId: string, db: D1Database) {
        if (!roomId) return;
        try {
            await db
                .prepare("UPDATE rooms SET content = ? WHERE id = ?")
                .bind(content, roomId)
                .run();
        } catch (e) {
            console.error("[DO] D1 backup error:", e);
        }
    }
}
