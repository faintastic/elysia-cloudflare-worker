import Elysia from "elysia";
import logger from "./lib/logger";
import mainController from "./routes/main";
import { ServerWebSocket, WebSocketHandler } from "bun";

import { getIP } from "./lib/ip";
import { createHash } from "crypto";
import { respond } from "./lib/respond";
import { type CustomWebSocket } from "./lib/websocket";

// Elysia initialization
// NOTE: AOT needs to be disabled to be hosted on cloudflare as a worker.
// https://elysiajs.com/at-glance.html
export const app = new Elysia({ aot: false })
  .onError(({ code, error }: any) => {
    return respond(error.status, {
      success: false,
      message: "An error has occurred while requesting",
      code: `${error.status} (${code})`,
    });
  })
  .onRequest(({ request }) => {
    const ip = getIP(request.headers);
    const hashedIP = createHash("sha1").update(ip).digest("hex");

    logger.log(
      `info`,
      `New ${request.method} request sent to ${request.url} from ${hashedIP}`
    );
  })
  .use(mainController);

// Websocket Routes
// NOTE: This is a custom implementation and not using Elysia's built-in websocket handling
// this is due to the fact that when "aot" is disabled, Elysia's websocket handling does not work
// "aot" needs to be disabled to be hosted on cloudflare as a worker.
export const websocketRoutes = [
  {
    path: "/ws",
    message(ws: CustomWebSocket, message: string | Buffer) {
      ws.send(`Non-Elysia WS echo: ${message}`);
    },
    open(ws: CustomWebSocket) {
      ws.send("Welcome to the non-Elysia WebSocket server!");
    },
    close(ws: CustomWebSocket, code: number, reason: string) {
    },
  },
  {
    path: "/ws2",
    message(ws: CustomWebSocket, message: string | Buffer) {
      ws.send(`Non-Elysia WS2 echo: ${message}`);
    },
    open(ws: CustomWebSocket) {
      ws.send("Welcome to the non-Elysia WebSocket server 2!");
    },
    close(ws: CustomWebSocket, code: number, reason: string) {
    },
  },
];
