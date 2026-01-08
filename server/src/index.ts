import { DurableObject } from "cloudflare:workers";

/**
 * 카운터 상태를 관리하는 Durable Object 클래스
 */
export class Counter extends DurableObject {
    /**
     * HTTP 요청을 처리합니다.
     * @param request 들어오는 요청
     * @returns 카운트 값 또는 에러 메시지
     */
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // 현재 상태에서 값을 가져오거나 0으로 초기화
        let value: number = (await this.ctx.storage.get<number>("value")) || 0;

        switch (url.pathname) {
            case "/increment":
                value++;
                await this.ctx.storage.put("value", value);
                break;
            case "/decrement":
                value--;
                await this.ctx.storage.put("value", value);
                break;
            case "/":
                // 현재 값을 조회함
                break;
            default:
                return new Response("Not Found", { status: 404 });
        }

        return new Response(`Count: ${value} (Time: ${new Date().toISOString()})`);
    }
}

interface Env {
    COUNTER: DurableObjectNamespace<Counter>;
}

/**
 * 메인 워커 핸들러
 */
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // 단일 인스턴스 "global"을 사용하거나 경로/쿼리로 ID를 지정할 수 있음
        // 여기서는 테스트를 위해 "global" ID를 사용함
        const id = env.COUNTER.idFromName("global");
        const obj = env.COUNTER.get(id);

        return obj.fetch(request);
    },
};
