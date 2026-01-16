import { Elysia } from 'elysia';
import { respond } from '../lib/respond';

const mainController = new Elysia()
  .get("/", async () => {
    return respond(200, { message: "Hello, World!" });
  });

export default mainController;