import { websocketRoutes } from "../app";
import { ServerWebSocket, WebSocketHandler } from "bun";

// Custom WebSocket interface to include the path in the data property
// This is used to identify which route the WebSocket is for
// and to handle messages accordingly
export interface CustomWebSocket extends ServerWebSocket<{ path: string }> {
  data: {
    path: string;
  };
}

// WebSocket handler for handling messages, open and close events
export const websocketHandler: WebSocketHandler<{ path: string }> = {
  message(ws: CustomWebSocket, message: string | Buffer) {
    const route = websocketRoutes.find(r => r.path === ws.data.path);
    if (route) {
      route.message(ws, message);
    }
  },
  open(ws: CustomWebSocket) {
    const route = websocketRoutes.find(r => r.path === ws.data.path);
    if (route) {
      route.open(ws);
    }
  },
  close(ws: CustomWebSocket, code: number, reason: string) {
    const route = websocketRoutes.find(r => r.path === ws.data.path);
    if (route) {
      route.close(ws, code, reason);
    }
  },

  // Optional: set max message size, etc.
  // maxMessageSize: 1024 * 1024, // 1MB
};