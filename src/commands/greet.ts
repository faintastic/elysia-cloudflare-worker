import { InteractionResponseType, ApplicationCommandOptionType, InteractionType } from 'discord-api-types/v10';
import type { APIApplicationCommandInteraction, APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import type { Command } from '../lib/discord/loader';
import { getStringOption, getUserOption, getIntegerOption } from '../lib/discord/optionHelper';

export default {
  name: "greet",
  description: "Greet a user with a custom message",
  
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "target",
      description: "The user to greet",
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "message",
      description: "Custom greeting message",
      required: false,
      max_length: 200
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "times",
      description: "How many times to greet",
      required: false,
      min_value: 1,
      max_value: 5,
      choices: [
        { name: "Once", value: 1 },
        { name: "Twice", value: 2 },
        { name: "Three times", value: 3 }
      ]
    }
  ],
  
  dm_permission: true,
  
  async execute(interaction: APIApplicationCommandInteraction) {
    // Type guard to ensure this is a chat input command
    if (interaction.type !== InteractionType.ApplicationCommand) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "Invalid interaction type",
          flags: 64 // Ephemeral
        }
      };
    }
    
    const cmdInteraction = interaction as APIChatInputApplicationCommandInteraction;
    
    // Use helper functions to safely extract option values
    const options = cmdInteraction.data.options;
    
    const targetUserId = getUserOption(options, "target");
    const customMessage = getStringOption(options, "message") || "Hello";
    const times = getIntegerOption(options, "times") || 1;
    
    if (!targetUserId) {
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: "Error: User not found!",
          flags: 64 // Ephemeral
        }
      };
    }
    
    // Build the response
    const greeting = Array(times).fill(`${customMessage}, <@${targetUserId}>!`).join("\n");
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: greeting
      }
    };
  }
} satisfies Command;
