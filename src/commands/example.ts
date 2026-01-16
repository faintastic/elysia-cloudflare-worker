import { InteractionResponseType, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, Locale } from 'discord-api-types/v10';
import type { APIApplicationCommandInteraction } from 'discord-api-types/v10';
import type { Command } from '../lib/discord/loader';

export default {
  name: "example",
  description: "An example command with all SlashCommandBuilder features",
  type: ApplicationCommandType.ChatInput, // Optional: defaults to ChatInput
  
  // Localization support
  name_localizations: {
    [Locale.SpanishES]: "ejemplo",
    [Locale.French]: "exemple"
  },
  description_localizations: {
    [Locale.SpanishES]: "Un comando de ejemplo con todas las características",
    [Locale.French]: "Une commande exemple avec toutes les fonctionnalités"
  },
  
  // Options - supports all Discord option types
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "text",
      description: "A text option",
      required: true,
      min_length: 1,
      max_length: 100
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "number",
      description: "A number option",
      required: false,
      min_value: 1,
      max_value: 100,
      choices: [
        { name: "Small", value: 1 },
        { name: "Medium", value: 50 },
        { name: "Large", value: 100 }
      ]
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "flag",
      description: "A boolean option",
      required: false
    },
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "Select a user",
      required: false
    },
    {
      type: ApplicationCommandOptionType.Channel,
      name: "channel",
      description: "Select a channel",
      required: false,
      channel_types: [ChannelType.GuildText, ChannelType.GuildVoice]
    },
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description: "Select a role",
      required: false
    },
    {
      type: ApplicationCommandOptionType.Mentionable,
      name: "mention",
      description: "Mention a user or role",
      required: false
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "decimal",
      description: "A decimal number",
      required: false,
      min_value: 0.1,
      max_value: 99.9
    },
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "file",
      description: "Upload a file",
      required: false
    }
  ],
  
  // Permissions: null = everyone, or use bitfield string
  default_member_permissions: null,
  
  // Whether this command is available in DMs
  dm_permission: true,
  
  // Whether this is an NSFW command
  nsfw: false,
  
  async execute(_interaction: APIApplicationCommandInteraction) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "Example command executed! Check out all the options available."
      }
    };
  }
} satisfies Command;
