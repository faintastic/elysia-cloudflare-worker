import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import type { APIMessageSelectMenuInteractionData } from 'discord-api-types/v10';
import type { Select } from '../lib/discord/loader';

export default {
  customId: "menu_select",
  
  async execute(_interaction: APIMessageSelectMenuInteractionData, values: string[]) {
    if (!values || values.length === 0) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "❌ No options selected!",
          flags: MessageFlags.Ephemeral
        }
      };
    }
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `✅ You selected: ${values.join(", ")}`,
        flags: MessageFlags.Ephemeral
      }
    };
  }
} satisfies Select;
