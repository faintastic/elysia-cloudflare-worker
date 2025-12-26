/**
This is a custom implementation and not using Elysia's built-in websocket handling.
This is due to the fact that when "aot" is disabled, Elysia's websocket handling does not work.
"aot" needs to be disabled to be hosted on cloudflare as a worker.

As of December 24, 2025, Elysia and cloudflare workers do not like websockets, custom implementation is needed.
*/
import type { ServerWebSocket } from "bun";

export interface CustomWebSocket extends ServerWebSocket<{ path: string }> {
  data: {
    path: string;
  };
}

export interface WebSocketRoute {
  path: string;
  message: (ws: CustomWebSocket, message: string | Buffer) => void;
  open: (ws: CustomWebSocket) => void;
  close: (ws: CustomWebSocket, code: number, reason: string) => void;
}

export class CustomWebsocketHandler {
  routes: WebSocketRoute[];

  /**
   * Creates a new CustomWebsocketHandler instance
   * @param options - Configuration options
   * @param options.routes - Array of websocket route handlers
   */
  constructor({ routes }: { routes: WebSocketRoute[] }) {
    this.routes = routes;
    this.message = this.message.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  /**
   * Handles incoming websocket messages
   * @param ws - The websocket connection
   * @param message - The message received from the client
   */
  message(ws: CustomWebSocket, message: string | Buffer) {
    const route = this.routes.find((r) => r.path === ws.data.path);
    if (route) {
      try {
        route.message(ws, message);
      } catch (error) {
        console.error(`Error handling websocket message on ${ws.data.path}:`, error);
      }
    }
  }

  /**
   * Handles websocket connection open events
   * @param ws - The websocket connection that was opened
   */
  open(ws: CustomWebSocket) {
    const route = this.routes.find((r) => r.path === ws.data.path);
    if (route) {
      try {
        route.open(ws);
      } catch (error) {
        console.error(`Error opening websocket on ${ws.data.path}:`, error);
        ws.close(1011, "Internal server error");
      }
    } else {
      ws.send(`No route found for path: ${ws.data.path}, closing connection.`);
      ws.close(1000, "No route found");
    }
  }

  /**
   * Handles websocket connection close events
   * @param ws - The websocket connection that was closed
   * @param code - The close status code
   * @param reason - The reason for closing the connection
   */
  close(ws: CustomWebSocket, code: number, reason: string) {
    const route = this.routes.find((r) => r.path === ws.data.path);
    if (route) {
      try {
        route.close(ws, code, reason);
      } catch (error) {
        console.error(`Error closing websocket on ${ws.data.path}:`, error);
      }
    }
  }
}