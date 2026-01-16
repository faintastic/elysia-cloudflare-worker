import { InteractionResponseType } from 'discord-api-types/v10';
import type { APIApplicationCommandInteraction } from 'discord-api-types/v10';
import type { Command } from '../lib/discord/loader';

export default {
  name: "ping",
  description: "Responds with pong!",
  
  async execute(_interaction: APIApplicationCommandInteraction) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "🏓 Pong!"
      }
    };
  }
} satisfies Command;
