import { DurableObject } from "cloudflare:workers";
import { SharePlzSession } from "./SharePlzSession";
import { getCorsHeaders, isOriginAllowed } from "./utils";

export interface Env {
    NEW_ROOM: DurableObjectNamespace<SharePlzSession>;
    DB: D1Database;
    ALLOWED_ORIGINS: string;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const corsHeaders = getCorsHeaders(request, env);

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        if (!isOriginAllowed(request, env)) {
            return new Response("Forbidden", { status: 403 });
        }

        const url = new URL(request.url);
        const roomId = url.searchParams.get("roomId");

        if (!roomId) {
            return new Response("Room ID required", { status: 400, headers: corsHeaders });
        }

        const id = env.NEW_ROOM.idFromName(roomId);
        const obj = env.NEW_ROOM.get(id);

        return obj.fetch(request);
    },
};

export { SharePlzSession };
export class Room extends DurableObject { }
export class ProjectAlpha extends DurableObject { }
