import { InteractionResponseType, ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { APIApplicationCommandInteraction } from 'discord-api-types/v10';
import type { Command } from '../lib/discord/loader';

export default {
  name: "manage",
  description: "Manage server settings",
  
  // Subcommand groups and subcommands
  options: [
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: "user",
      description: "Manage users",
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "ban",
          description: "Ban a user",
          options: [
            {
              type: ApplicationCommandOptionType.User,
              name: "target",
              description: "The user to ban",
              required: true
            },
            {
              type: ApplicationCommandOptionType.String,
              name: "reason",
              description: "Reason for ban",
              required: false,
              max_length: 512
            }
          ]
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "kick",
          description: "Kick a user",
          options: [
            {
              type: ApplicationCommandOptionType.User,
              name: "target",
              description: "The user to kick",
              required: true
            }
          ]
        }
      ]
    },
    {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: "channel",
      description: "Manage channels",
      options: [
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "create",
          description: "Create a new channel",
          options: [
            {
              type: ApplicationCommandOptionType.String,
              name: "name",
              description: "Channel name",
              required: true,
              min_length: 1,
              max_length: 100
            }
          ]
        },
        {
          type: ApplicationCommandOptionType.Subcommand,
          name: "delete",
          description: "Delete a channel",
          options: [
            {
              type: ApplicationCommandOptionType.Channel,
              name: "target",
              description: "The channel to delete",
              required: true
            }
          ]
        }
      ]
    },
    {
      type: ApplicationCommandOptionType.Subcommand,
      name: "settings",
      description: "View server settings"
    }
  ],
  
  // Require admin permissions (bitfield for Administrator)
  default_member_permissions: "8",
  
  // Not available in DMs
  dm_permission: false,
  
  async execute(_interaction: APIApplicationCommandInteraction) {
    // You would parse the subcommand/subcommand group from interaction.data.options
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "This would execute the appropriate subcommand based on user input."
      }
    };
  }
} satisfies Command;
