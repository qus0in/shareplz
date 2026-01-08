export class ConnectionManager {
    broadcast(sockets: WebSocket[], message: string, sender?: WebSocket) {
        for (const session of sockets) {
            if (session !== sender) {
                try {
                    session.send(message);
                } catch (e) {
                    // Hibernation API 관리
                }
            }
        }
    }

    acceptWebSocket(ctx: DurableObjectState, server: WebSocket, roomId: string) {
        ctx.acceptWebSocket(server);
        console.log(`[DO] WebSocket accepted for room: ${roomId}`);
    }
}
