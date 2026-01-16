/**
  Entry point for cloudflare Elysia integration
*/

import { CustomWebsocketHandler } from "./lib/ws";
import { app } from "./app";
import type { WebSocketRoute } from "./lib/ws";

const routeCache = new Map<string, WebSocketRoute>();
// websocketRoutes.forEach(route => routeCache.set(route.path, route));

const websocketHandler = new CustomWebsocketHandler({ routes: [] });

export default {
  async fetch(
    request: Request
  ): Promise<Response> {
    const upgradeHeader = request.headers.get("Upgrade")
    const pathname = new URL(request.url).pathname;

    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      if (typeof WebSocketPair !== 'undefined') {
        // WebSocket handling for environments that support WebSocketPair 
        // such as Cloudflare Workers
        const route = routeCache.get(pathname);
        
        if (!route) {
          return new Response("WebSocket route not found", { status: 404 });
        }

        try {
          const webSocketPair = new WebSocketPair();
          const [client, server] = Object.values(webSocketPair) as [WebSocket, WebSocket];

          server.addEventListener('message', (event) => {
            try {
              route.message(server as any, event.data);
            } catch (error) {
              console.error('WebSocket message error:', error);
            }
          });

          server.addEventListener('close', (event) => {
            try {
              route.close(server as any, event.code, event.reason);
            } catch (error) {
              console.error('WebSocket close error:', error);
            }
          });

          // Accept the WebSocket connection
          server.accept();

          try {
            route.open(server as any);
          } catch (error) {
            console.error('WebSocket open error:', error);
            server.close(1011, 'Internal server error');
            return new Response("WebSocket initialization failed", { status: 500 });
          }

          return new Response(null, {
            status: 101,
            webSocket: client as any
          });
        } catch (error) {
          console.error('WebSocket setup error:', error);
          return new Response("WebSocket setup failed", { status: 500 });
        }
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
      try {
        return await app.handle(request);
      } catch (error) {
        console.error('Request handling error:', error);
        return new Response("Internal server error", { status: 500 });
      }
    }
  },

  port: 3000,
  websocket: websocketHandler,
}