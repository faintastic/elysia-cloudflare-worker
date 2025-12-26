/**
  Main entry point for Elysia app
  Route controllers can be found in /src/routes/
  Websocket routes are at the bottom of this file
*/

import Elysia from "elysia";
import log from "./lib/log";

import { getIP } from "./lib/ip";
import { createHash } from "crypto";
import { respond } from "./lib/respond";
import type { CustomWebSocket, WebSocketRoute } from "./lib/ws";

import mainController from "./routes/main";

// NOTE: "aot" must be disabled in order to be hosted on cloudflare as a worker
// https://elysiajs.com/at-glance.html
export const app = new Elysia({ aot: false })
  .onError(({ code, error }: any) => {
    return respond(error.status, {
      message: "An error has occurred while requesting",
      code: `${error.status} (${code})`,
    });
  })
  .onRequest(({ request }) => {
    const ipAddress = getIP(request.headers);
    // Hash IP address for clients privacy
    const hashedIpAddress = createHash("sha1").update(ipAddress).digest("hex");

    log.info(`${request.method} -> ${request.url} from ${hashedIpAddress}`);
  })

  .use(mainController);

export const websocketRoutes: WebSocketRoute[] = [
  {
    path: "/ws",
    message(ws: CustomWebSocket, message: string | Buffer) {
      if (!message || (typeof message === 'string' && message.length === 0)) {
        ws.send("Error: Empty message received");
        return;
      }
      ws.send(`Non-Elysia WS echo: ${message}`);
    },
    open(ws: CustomWebSocket) {
      ws.send("Welcome to the non-Elysia WebSocket server!");
    },
    close(_ws: CustomWebSocket, _code: number, _reason: string) {
    },
  },
  {
    path: "/ws2",
    message(ws: CustomWebSocket, message: string | Buffer) {
      if (!message || (typeof message === 'string' && message.length === 0)) {
        ws.send("Error: Empty message received");
        return;
      }
      ws.send(`Non-Elysia WS2 echo: ${message}`);
    },
    open(ws: CustomWebSocket) {
      ws.send("Welcome to the non-Elysia WebSocket server 2!");
    },
    close(_ws: CustomWebSocket, _code: number, _reason: string) {
    },
  },
];