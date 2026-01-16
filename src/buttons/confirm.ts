import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import type { APIMessageButtonInteractionData } from 'discord-api-types/v10';
import type { Button } from '../lib/discord/loader';

export default {
  customId: "confirm",
  
  async execute(_interaction: APIMessageButtonInteractionData, args?: string[]) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `✅ Confirmed! ${args?.length ? `Args: ${args.join(', ')}` : ''}`,
        flags: MessageFlags.Ephemeral
      }
    };
  }
} satisfies Button;
