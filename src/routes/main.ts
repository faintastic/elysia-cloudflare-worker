import { Elysia } from 'elysia';
import { respond } from '../lib/respond';
import log from '../lib/log';
import { bulkOverwriteGlobalCommands, withDiscordInteraction } from '../lib/discord/discordHelper';
import { customBots } from '../app';
import { InteractionType, type APIInteraction } from 'discord-api-types/payloads/v9';
import { InteractionResponseType, ComponentType } from 'discord-api-types/v10';
import { loader } from '../lib/discord/loader';
import { parseCustomId, extractModalFields, extractSelectValues } from '../lib/discord/componentHelper';

// Load all handlers on startup
await loader.loadAll();

// Cooldown storage: Map<handlerType_handlerId, Map<userId, timestamp>>
const cooldowns = new Map<string, Map<string, number>>();

/**
 * Check and enforce cooldown for a handler
 */
function checkCooldown(handlerType: string, handlerId: string, userId: string, cooldownSeconds?: number): { onCooldown: boolean; timeLeft: number } {
  if (!cooldownSeconds || cooldownSeconds === 0) {
    return { onCooldown: false, timeLeft: 0 };
  }

  const key = `${handlerType}_${handlerId}`;
  const now = Date.now();
  const cooldownAmount = cooldownSeconds * 1000;

  if (!cooldowns.has(key)) {
    cooldowns.set(key, new Map());
  }

  const timestamps = cooldowns.get(key)!;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId)! + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return { onCooldown: true, timeLeft };
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);

  return { onCooldown: false, timeLeft: 0 };
}

const mainController = new Elysia()
  .get("/", async () => {
    return respond(200, { message: "Welcome to discord interactions example "});
  })

  .post("/interaction", async ({ body, request }) => {
    try {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

      const result = await withDiscordInteraction(bodyString, request.headers);

      if (result instanceof Response) {
        return result;
      }

      const { interaction } = result as { interaction: APIInteraction; bot: typeof customBots[keyof typeof customBots] };

      // Handle Application Commands (slash commands)
      if (interaction.type === InteractionType.ApplicationCommand) {
        const { data } = interaction;
        const command = loader.getCommand(data.name);

        if (command) {
          try {
            // Check cooldown
            const cooldown = checkCooldown('command', data.name, (interaction as any).user?.id || (interaction as any).member?.user?.id, command.cooldown);
            
            if (cooldown.onCooldown) {
              return respond(200, {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                  content: `⏱️ Slow down! Please wait ${cooldown.timeLeft.toFixed(1)} more seconds before using this command again.`,
                  flags: 64
                }
              });
            }

            const response = await command.execute(interaction);
            return respond(200, response);
          } catch (error) {
            log.error(`Error executing command ${data.name}: ${(error as Error).message}`);
            return respond(200, {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: {
                content: `❌ An error occurred while executing this command.`,
                flags: 64
              }
            });
          }
        } else {
          return respond(200, {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: `❌ Unknown command: ${data.name}`,
              flags: 64
            }
          });
        }
      }
      
      // Handle Message Components (buttons and select menus)
      if (interaction.type === InteractionType.MessageComponent) {
        const { data } = interaction as any;
        const { id, args } = parseCustomId(data.custom_id);
        const userId = (interaction as any).user?.id || (interaction as any).member?.user?.id;

        // Handle buttons
        if (data.component_type === ComponentType.Button) {
          const button = loader.getButton(id);
          
          if (button) {
            try {
              // Check cooldown
              const cooldown = checkCooldown('button', id, userId, button.cooldown);
              
              if (cooldown.onCooldown) {
                return respond(200, {
                  type: InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: `⏱️ Slow down! Please wait ${cooldown.timeLeft.toFixed(1)} more seconds before clicking this button again.`,
                    flags: 64
                  }
                });
              }

              log.info(`Button "${id}" clicked by user ${userId}${args?.length ? ` with args: ${args.join(', ')}` : ''}`);
              const response = await button.execute(interaction as any, args);
              return respond(200, response);
            } catch (error) {
              log.error(`Error executing button ${id}: ${(error as Error).message}`);
              return respond(200, {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                  content: `❌ An error occurred while processing this button.`,
                  flags: 64
                }
              });
            }
          } else {
            return respond(200, {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: {
                content: `❌ This button is not recognized by the bot anymore.`,
                flags: 64
              }
            });
          }
        }
        
        // Handle select menus
        else {
          const select = loader.getSelect(id);
          
          if (select) {
            try {
              // Check cooldown
              const cooldown = checkCooldown('select', id, userId, select.cooldown);
              
              if (cooldown.onCooldown) {
                return respond(200, {
                  type: InteractionResponseType.ChannelMessageWithSource,
                  data: {
                    content: `⏱️ Slow down! Please wait ${cooldown.timeLeft.toFixed(1)} more seconds before using this menu again.`,
                    flags: 64
                  }
                });
              }

              const values = extractSelectValues(interaction as any);
              log.info(`Select menu "${id}" used by user ${userId} with values: ${values.join(', ')}`);
              const response = await select.execute(interaction as any, values);
              return respond(200, response);
            } catch (error) {
              log.error(`Error executing select menu ${id}: ${(error as Error).message}`);
              return respond(200, {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                  content: `❌ An error occurred while processing this menu.`,
                  flags: 64
                }
              });
            }
          } else {
            return respond(200, {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: {
                content: `❌ This menu is not recognized by the bot anymore.`,
                flags: 64
              }
            });
          }
        }
      }
      
      // Handle Modal Submissions
      if (interaction.type === InteractionType.ModalSubmit) {
        const { data } = interaction as any;
        const { id } = parseCustomId(data.custom_id);
        const userId = (interaction as any).user?.id || (interaction as any).member?.user?.id;
        
        const modal = loader.getModal(id);
        
        if (modal) {
          try {
            // Check cooldown
            const cooldown = checkCooldown('modal', id, userId, modal.cooldown);
            
            if (cooldown.onCooldown) {
              return respond(200, {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                  content: `⏱️ Slow down! Please wait ${cooldown.timeLeft.toFixed(1)} more seconds before submitting this form again.`,
                  flags: 64
                }
              });
            }

            const fields = extractModalFields(interaction as any);
            log.info(`Modal "${id}" submitted by user ${userId}`);
            const response = await modal.execute(interaction as any, fields);
            return respond(200, response);
          } catch (error) {
            log.error(`Error executing modal ${id}: ${(error as Error).message}`);
            return respond(200, {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: {
                content: `❌ An error occurred while processing your submission.`,
                flags: 64
              }
            });
          }
        } else {
          return respond(200, {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: `❌ This form is not recognized by the bot anymore.`,
              flags: 64
            }
          });
        }
      }
    } catch (error) {
      log.error(`Error processing interaction: ${(error as Error).message}`);
      return respond(500, { error: "Internal Server Error" });
    }
  })

  .get("/refresh/:id", async ({ params: { id } }) => {
    const bot = customBots[id as keyof typeof customBots];

    if (!bot) {
      return respond(404, { success: false, message: "Bot not found" });
    }

    if (!bot.botToken) {
      return respond(400, { success: false, message: "Bot token not configured" });
    }

    try {
      const commands = loader.getAllCommands();
      
      const commandPayloads = commands.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        type: cmd.type,
        options: cmd.options as any,
        default_member_permissions: cmd.default_member_permissions,
        dm_permission: cmd.dm_permission,
        nsfw: cmd.nsfw,
        name_localizations: cmd.name_localizations,
        description_localizations: cmd.description_localizations
      }));

      const result = await bulkOverwriteGlobalCommands(bot.botToken, id, commandPayloads) as any[];

      return respond(200, { 
        success: true, 
        message: `Successfully registered ${result.length} command(s)`,
        commands: result.map((c: any) => c.name)
      });
    } catch (error) {
      return respond(500, { 
        success: false, 
        message: "Failed to register commands",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  })

export default mainController;