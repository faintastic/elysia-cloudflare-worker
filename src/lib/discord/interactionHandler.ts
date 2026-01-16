/**
 * Interaction Handler and Router
 * 
 * This module provides a complete interaction routing system that handles all Discord
 * interaction types (commands, buttons, select menus, modals) and routes them to the
 * appropriate handlers loaded by the InteractionLoader.
 * 
 * This is an example/reference implementation. In production, you may want to use
 * a more customized routing approach like the one in routes/main.ts which includes
 * cooldown management and enhanced error handling.
 * 
 * @module interactionHandler
 */

import { InteractionType, ComponentType } from 'discord-api-types/v10';
import type { APIInteraction } from 'discord-api-types/v10';
import { loader } from './loader';
import { parseCustomId, extractModalFields, extractSelectValues } from './componentHelper';

/**
 * Initialize the bot by loading all interaction handlers.
 * 
 * This should be called once at startup before handling any interactions.
 * 
 * @example
 * ```ts
 * await initializeBot();
 * // Output: Loading interaction handlers...
 * //         ✅ All handlers loaded!
 * ```
 */
export async function initializeBot() {
  console.log('Loading interaction handlers...');
  await loader.loadAll();
  console.log('✅ All handlers loaded!');
}

/**
 * Route a Discord interaction to the appropriate handler.
 * 
 * Determines the interaction type and routes it to the correct handler (command, button,
 * select menu, or modal). Handles errors gracefully and returns ephemeral error messages
 * to users when handlers are not found or execution fails.
 * 
 * @param interaction - The Discord interaction to handle
 * @returns A Discord interaction response object
 * 
 * @example
 * ```ts
 * const response = await handleInteraction(interaction);
 * return new Response(JSON.stringify(response), {
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * ```
 */
export async function handleInteraction(interaction: APIInteraction) {
  try {
    switch (interaction.type) {
      case InteractionType.ApplicationCommand: {
        // Handle slash commands
        const command = loader.getCommand(interaction.data.name);
        if (!command) {
          return {
            type: 4,
            data: { content: '❌ Command not found!', flags: 64 }
          };
        }
        return await command.execute(interaction);
      }

      case InteractionType.MessageComponent: {
        // Handle buttons and select menus
        const { id, args } = parseCustomId(interaction.data.custom_id);

        if (interaction.data.component_type === ComponentType.Button) {
          // Handle button
          const button = loader.getButton(id);
          if (!button) {
            return {
              type: 4,
              data: { content: '❌ Button handler not found!', flags: 64 }
            };
          }
          return await button.execute(interaction as any, args);
        } else {
          // Handle select menu (all types: String, User, Role, Channel, Mentionable)
          const select = loader.getSelect(id);
          if (!select) {
            return {
              type: 4,
              data: { content: '❌ Select menu handler not found!', flags: 64 }
            };
          }
          const values = extractSelectValues(interaction as any);
          return await select.execute(interaction as any, values);
        }
      }

      case InteractionType.ModalSubmit: {
        // Handle modal submissions
        const { id } = parseCustomId(interaction.data.custom_id);
        const modal = loader.getModal(id);
        if (!modal) {
          return {
            type: 4,
            data: { content: '❌ Modal handler not found!', flags: 64 }
          };
        }
        const fields = extractModalFields(interaction as any);
        return await modal.execute(interaction as any, fields);
      }

      default:
        console.warn(`Unhandled interaction type: ${interaction.type}`);
        return {
          type: 4,
          data: { content: '❌ Interaction type not supported!', flags: 64 }
        };
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    return {
      type: 4,
      data: { 
        content: '❌ An error occurred while processing your interaction.',
        flags: 64 
      }
    };
  }
}