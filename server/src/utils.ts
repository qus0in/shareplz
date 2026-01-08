import { Env } from "./index";

export function getCorsHeaders(request: Request, env: Env): Record<string, string> {
    const origin = request.headers.get("Origin");
    const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",");

    if (origin && allowedOrigins.includes(origin)) {
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Upgrade",
        };
    }

    return {};
}

export function isOriginAllowed(request: Request, env: Env): boolean {
    const origin = request.headers.get("Origin");
    // Origin이 없으면 차단 (API/WS 전용)
    if (!origin) return false;

    const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",");
    return allowedOrigins.includes(origin);
}
