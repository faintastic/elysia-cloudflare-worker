/**
 * Command Registration Utility
 * 
 * This module handles the registration of all Discord commands with Discord's API.
 * It uses bulk registration (PUT endpoint) to efficiently update all commands in a
 * single request, avoiding rate limits and ensuring consistency.
 * 
 * @module registerCommands
 */

import { loader } from './loader';
import { bulkOverwriteGlobalCommands } from './discordHelper';
import log from '../log';

/**
 * Load and register all commands with Discord using bulk overwrite.
 * 
 * This function:
 * 1. Loads all command modules from the commands directory
 * 2. Builds an array of command payloads with all necessary properties
 * 3. Sends a single PUT request to Discord to register all commands at once
 * 4. Logs detailed information about the registration process
 * 
 * Using bulk registration (PUT) instead of individual POST requests:
 * - Avoids Discord's 200 command creates per day rate limit
 * - Updates existing commands automatically if definitions changed
 * - Removes commands not in the array (keeps your bot's command list clean)
 * - Completes in a single API request instead of N requests
 * 
 * @param token - The bot's authentication token
 * @param clientId - The bot's application/client ID
 * @throws Error if command loading or registration fails
 * 
 * @example
 * ```ts
 * await registerCommands(process.env.BOT_TOKEN, process.env.CLIENT_ID);
 * // Output:
 * // Registering 5 command(s) with Discord...
 * // ✓ Successfully registered 5 command(s)
 * //   - ping
 * //   - help
 * //   ...
 * ```
 */
export async function registerCommands(token: string, clientId: string) {
  // Load all commands from the commands directory
  await loader.loadCommands();
  const commands = loader.getAllCommands();
  
  log.info(`Registering ${commands.length} command(s) with Discord...`);
  
  try {
    // Build the command payload array
    const commandPayloads = commands.map(command => ({
      name: command.name,
      description: command.description,
      type: command.type,
      options: command.options as any,
      default_member_permissions: command.default_member_permissions,
      dm_permission: command.dm_permission,
      nsfw: command.nsfw,
      name_localizations: command.name_localizations,
      description_localizations: command.description_localizations
    }));
    
    // Register all commands in a single request
    const result = await bulkOverwriteGlobalCommands(token, clientId, commandPayloads) as any[];
    
    log.info(`✓ Successfully registered ${result.length} command(s)`);
    result.forEach((cmd: any) => log.info(`  - ${cmd.name}`));
  } catch (error) {
    log.error(`✗ Failed to register commands: ${(error as Error).message}`);
    throw error;
  }
  
  log.info('Command registration complete!');
}