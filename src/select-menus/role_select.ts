import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import type { APIMessageSelectMenuInteractionData } from 'discord-api-types/v10';
import type { Select } from '../lib/discord/loader';

export default {
  customId: "role_select",
  
  async execute(_interaction: APIMessageSelectMenuInteractionData, values: string[]) {
    if (!values || values.length === 0) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "❌ No roles selected!",
          flags: MessageFlags.Ephemeral
        }
      };
    }
    
    const roleList = values.map(roleId => `<@&${roleId}>`).join(", ");
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `✅ You selected: ${roleList}`,
        flags: MessageFlags.Ephemeral
      }
    };
  }
} satisfies Select;
