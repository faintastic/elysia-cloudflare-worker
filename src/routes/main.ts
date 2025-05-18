import { Elysia } from 'elysia';
import { respond } from '../lib/respond';

const mainController = new Elysia()
  .get("/", async (context) => {
    return respond(200, { success: true, message: "Hello, World!" });
  })
  .get("/ping", async (context) => {
    return respond(200, { success: true, message: "Pong!" });
  });

export default mainController;