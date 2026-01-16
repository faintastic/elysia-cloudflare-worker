import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import type { APIModalSubmitInteraction } from 'discord-api-types/v10';
import type { Modal } from '../lib/discord/loader';

export default {
  customId: "test_modal",
  
  async execute(_interaction: APIModalSubmitInteraction, fields: Map<string, string>) {
    const name = fields.get("test_name");
    const message = fields.get("test_message");
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `✅ **Form Submitted!**\n\n**Name:** ${name}\n**Message:** ${message}`,
        flags: MessageFlags.Ephemeral
      }
    };
  }
} satisfies Modal;
