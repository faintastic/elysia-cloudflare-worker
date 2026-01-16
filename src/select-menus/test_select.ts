import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import type { APIMessageSelectMenuInteractionData } from 'discord-api-types/v10';
import type { Select } from '../lib/discord/loader';

export default {
  customId: "test_select",
  
  async execute(_interaction: APIMessageSelectMenuInteractionData, values: string[]) {
    const selected = values[0] || 'unknown';
    const optionNames: Record<string, string> = {
      opt1: "Option 1",
      opt2: "Option 2",
      opt3: "Option 3"
    };
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `✅ You selected: **${optionNames[selected] || selected}**`,
        flags: MessageFlags.Ephemeral
      }
    };
  }
} satisfies Select;
