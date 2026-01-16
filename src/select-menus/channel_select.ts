import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import type { APIMessageSelectMenuInteractionData } from 'discord-api-types/v10';
import type { Select } from '../lib/discord/loader';

export default {
  customId: "channel_select",
  
  async execute(_interaction: APIMessageSelectMenuInteractionData, values: string[]) {
    if (!values || values.length === 0) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "❌ No channels selected!",
          flags: MessageFlags.Ephemeral
        }
      };
    }
    
    const channelList = values.map(channelId => `<#${channelId}>`).join(", ");
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `✅ You selected: ${channelList}`,
        flags: MessageFlags.Ephemeral
      }
    };
  }
} satisfies Select;
