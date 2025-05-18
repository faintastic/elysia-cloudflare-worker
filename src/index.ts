import { Env } from "bun"
import { app, websocketRoutes } from "./app"
import { websocketHandler } from "./lib/websocket";

export default {
  async fetch(
    request: Request,
    env: Env,
  ): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade")
    const pathname = new URL(request.url).pathname;

    // Websocket Handling
    // NOTE: This is a custom implementation and not using Elysia's built-in websocket handling
    // this is due to the fact that when "aot" is disabled, Elysia's websocket handling does not work
    // "aot" needs to be disabled to be hosted on cloudflare as a worker.
    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      if (typeof WebSocketPair !== 'undefined') {
        // WebSocket handling for environments that support WebSocketPair 
        // such as Cloudflare Workers
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);
        
        server.accept();
        
        server.addEventListener('message', (event) => {
          const route = websocketRoutes.find(r => r.path === pathname);
          if (route) {
            // @ts-ignore - Errors but it works (if it ain't broke, don't fix it)
            route.message(server, event.data);
          }
        });
        
        server.addEventListener('close', (event) => {
          const route = websocketRoutes.find(r => r.path === pathname);
          if (route) {
            // @ts-ignore - Errors but it works (if it ain't broke, don't fix it)
            route.close(server, event.code, event.reason);
          }
        });
        
        const route = websocketRoutes.find(r => r.path === pathname);
        if (route) {
            // @ts-ignore - Errors but it works (if it ain't broke, don't fix it)
          route.open(server);
        }
        
        return new Response(null, {
          status: 101,
          webSocket: client
        });
      } else {
        // Fallback for environments that do not support WebSocketPair
        // used for development
        // NOTE: This is a custom implementation and not using Elysia's built-in websocket handling
        const success = (this as any).upgrade(request, {
          data: { path: pathname }
        });
        if (success) {
          return new Response(null, { status: 101 });
        } else {
          return new Response("WebSocket upgrade failed", { status: 400 });
        }
      }
    } else {
      // Normal HTTP request handling
      // Use Elysia's built-in request handling located in the app
      return await app.handle(request)
    }
  },
  port: 3000,
  websocket: websocketHandler,
}
