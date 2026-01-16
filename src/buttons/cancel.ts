import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import type { APIMessageButtonInteractionData } from 'discord-api-types/v10';
import type { Button } from '../lib/discord/loader';

export default {
  customId: "cancel",
  
  async execute(_interaction: APIMessageButtonInteractionData, _args?: string[]) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "❌ Cancelled!",
        flags: MessageFlags.Ephemeral
      }
    };
  }
} satisfies Button;
