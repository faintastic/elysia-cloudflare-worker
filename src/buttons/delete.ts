import { InteractionResponseType } from 'discord-api-types/v10';
import type { APIMessageButtonInteractionData } from 'discord-api-types/v10';
import type { Button } from '../lib/discord/loader';

export default {
  customId: "delete",
  
  async execute(_interaction: APIMessageButtonInteractionData, _args?: string[]) {
    // Args would contain any data after the colon in customId
    // e.g., "delete:messageId" would give args = ["messageId"]
    
    return {
      type: InteractionResponseType.UpdateMessage,
      data: {
        content: "🗑️ Message deleted!",
        components: [] // Remove all components
      }
    };
  }
} satisfies Button;
