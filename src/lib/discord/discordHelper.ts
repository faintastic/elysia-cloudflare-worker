/**
 * Discord API Helper Utilities
 * 
 * This module provides core Discord API interaction functionality including:
 * - Request signature verification using Ed25519
 * - Global command registration (single and bulk)
 * - Interaction parsing and validation
 * 
 * @module discordHelper
 */

import { type APIApplicationCommand, type APIInteraction, InteractionType } from "discord-api-types/v10"
import nacl from "tweetnacl"
import { respond } from "../respond"
import { customBots } from "../../app"

/**
 * Verify Discord request headers using Ed25519 signature verification.
 * 
 * Discord signs all requests with Ed25519 to ensure they come from Discord's servers.
 * This function validates the signature using the bot's public key.
 * 
 * @param timestamp - The X-Signature-Timestamp header value
 * @param rawBody - The raw request body as a string
 * @param signature - The X-Signature-Ed25519 header value
 * @param public_key - The bot's public key from the Discord developer portal
 * @returns True if the signature is valid, false otherwise
 * 
 * @internal
 */
const verifyHeaders = (timestamp: string, rawBody: string, signature: string, public_key: string) => {
  return nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, "hex"),
    Buffer.from(public_key, "hex")
  )
}

/**
 * Parse the raw request body as a string.
 * 
 * Helper function to extract the raw body text from a Request object.
 * This is needed for signature verification.
 * 
 * @param request - The incoming HTTP request
 * @returns The request body as a string
 */
export const parseRawBodyAsString = async (request: Request): Promise<string> => {
  return await request.text()
}

/**
 * Verify and parse a Discord interaction request.
 * 
 * This is the main entry point for handling Discord interaction requests. It:
 * 1. Validates the request signature to ensure it's from Discord
 * 2. Parses the interaction payload
 * 3. Looks up the bot configuration
 * 4. Handles PING interactions automatically
 * 
 * @param body - The raw request body as a string
 * @param headers - The request headers containing signature and timestamp
 * @returns An object with the parsed interaction and bot config, or an error response
 * 
 * @example
 * ```ts
 * const result = await withDiscordInteraction(body, headers);
 * if ('interaction' in result) {
 *   // Valid interaction, process it
 *   const { interaction, bot } = result;
 * } else {
 *   // Error response
 *   return result;
 * }
 * ```
 */
export async function withDiscordInteraction(body: string, headers: Headers) {
  const sig = headers.get("x-signature-ed25519")
  const timestamp = headers.get("x-signature-timestamp")

  if (typeof sig !== "string" || typeof timestamp !== "string") {
    return respond(401, { error: "You cannot visit this endpoint directly, this only accepts requests from Discord." })
  }

  try {
    const interaction: APIInteraction = JSON.parse(body)
    const { type, application_id } = interaction
    if (!type || !application_id) {
      return respond(400, { error: "Invalid interaction payload." })
    }

    const bot = customBots[application_id as keyof typeof customBots]
    if (!bot) {
      return respond(404, { error: "Bot not found." })
    }

    const isValid = verifyHeaders(timestamp, body, sig, bot.publicKey)
    if (!isValid) {
      return respond(401, { error: "Invalid request signature. (Request may not be from Discord)" })
    }

    if (type === InteractionType.Ping) {
      return respond(200, { type: 1 })
    }

    return { interaction, bot }
  } catch (error) {
    console.error("[ERROR] Exception in withDiscordInteraction:", error)
    return respond(500, { error: "An error occurred while processing the Discord interaction." })
  }
}

/**
 * Type definition for creating a global Discord command.
 * 
 * Includes all properties from APIApplicationCommand except id and application_id,
 * with name and description being required.
 */
export type CreateGlobalCommand = Partial<Omit<APIApplicationCommand, "id" | "application_id">> & {
  name: string;
  description: string;
}

/**
 * Create a single global Discord command.
 * 
 * Registers a single command with Discord's API. For registering multiple commands,
 * prefer using bulkOverwriteGlobalCommands() to avoid rate limiting.
 * 
 * @param token - The bot's authentication token
 * @param clientid - The bot's application/client ID
 * @param command - The command definition to register
 * @returns The registered command data from Discord's API
 * @throws Error if the registration fails
 * 
 * @see bulkOverwriteGlobalCommands for bulk registration
 */
export async function createGlobalCommand(token: string, clientid: string, command: CreateGlobalCommand) {
  const response = await fetch(`https://discord.com/api/v10/applications/${clientid}/commands`, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  })

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create command: ${response.status} ${response.statusText}\n${errorText}`)
  }

  return await response.json()
}

/**
 * Bulk overwrite all global commands with a single API request.
 * 
 * This is the recommended way to register commands as it:
 * - Uses a single API request instead of one per command
 * - Avoids Discord's rate limiting (200 creates per day)
 * - Automatically removes commands not in the array
 * - Updates existing commands if their definition changed
 * 
 * @param token - The bot's authentication token
 * @param clientid - The bot's application/client ID
 * @param commands - Array of command definitions to register
 * @returns Array of registered command data from Discord's API
 * @throws Error if the bulk registration fails
 * 
 * @example
 * ```ts
 * const commands = [
 *   { name: "ping", description: "Pong!" },
 *   { name: "help", description: "Show help" }
 * ];
 * await bulkOverwriteGlobalCommands(token, clientId, commands);
 * ```
 */
export async function bulkOverwriteGlobalCommands(token: string, clientid: string, commands: CreateGlobalCommand[]) {
  const response = await fetch(`https://discord.com/api/v10/applications/${clientid}/commands`, {
    method: "PUT",
    headers: {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands)
  })

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to bulk register commands: ${response.status} ${response.statusText}\n${errorText}`)
  }

  return await response.json()
}