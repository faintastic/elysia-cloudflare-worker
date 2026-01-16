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

import mainController from "./routes/main";

// Discord Interactions Mapping
// Ideally you would connect this to a database, but this is just an example.
export const customBots = {
  "": {
    clientId: "",
    botToken: "",
    botSecret: "",
    publicKey: ""
  },

  "": {
    clientId: "",
    botToken: "",
    botSecret: "",
    publicKey: ""
  }
} as const

export type CustomBot = (typeof customBots)[keyof typeof customBots];

// NOTE: "aot" must be disabled in order to be hosted on cloudflare as a worker
// https://elysiajs.com/at-glance.html
export const app = new Elysia({ 
  aot: false,
  normalize: false
})
  .onError(({ code, error }: any) => {
    return respond(error.status, {
      message: "An error has occurred while requesting",
      code: `${error.status} (${code})`,
    });
  })
  .onRequest(async ({ request }) => {
    const ipAddress = getIP(request.headers);
    const hashedIpAddress = createHash("sha1").update(ipAddress).digest("hex");

    let showArea: string = "";
    if (request.method === "POST" && request.url.endsWith("/interaction")) {
      try {
        const body = await request.clone().text();
        const interaction = JSON.parse(body);
        
        if (interaction.type === 2) {
          showArea = "command";
        } else if (interaction.type === 3) {
          if (interaction.data?.component_type === 2) {
            showArea = "button";
          } else {
            showArea = "select menu";
          }
        } else if (interaction.type === 5) {
          showArea = "modal";
        }
      } catch {
        showArea = "command";
      }
    }

    log.info(`${request.method} -> ${request.url} from ${hashedIpAddress}`, showArea);
  })

  .use(mainController);