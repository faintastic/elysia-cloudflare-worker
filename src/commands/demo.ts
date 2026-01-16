import { 
  InteractionResponseType, 
  ComponentType, 
  ButtonStyle,
  ChannelType
} from 'discord-api-types/v10';
import type { APIApplicationCommandInteraction } from 'discord-api-types/v10';
import type { Command } from '../lib/discord/loader';
import { buildCustomId } from '../lib/discord/componentHelper';

/**
 * Demo command showing how to create buttons, modals, and select menus
 */
export default {
  name: "demo",
  description: "Demo command showing buttons, modals, and select menus",
  
  async execute(_interaction: APIApplicationCommandInteraction) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "🎮 **Component Demo**\nChoose a demo below:",
        components: [
          // Row 1: Buttons
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                label: "Confirm",
                custom_id: "confirm"
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Secondary,
                label: "Cancel",
                custom_id: "cancel"
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Danger,
                label: "Delete",
                custom_id: buildCustomId("delete", "demo-message")
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Link,
                label: "Documentation",
                url: "https://discord.com/developers/docs/interactions/message-components"
              }
            ]
          },
          // Row 2: Open Modal Button
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                label: "Open Feedback Modal",
                custom_id: "open_feedback_modal"
              }
            ]
          },
          // Row 3: String Select Menu
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.StringSelect,
                custom_id: "menu_select",
                placeholder: "Choose an option...",
                min_values: 1,
                max_values: 3,
                options: [
                  {
                    label: "Option 1",
                    value: "option1",
                    description: "This is the first option",
                    emoji: { name: "1️⃣" }
                  },
                  {
                    label: "Option 2",
                    value: "option2",
                    description: "This is the second option",
                    emoji: { name: "2️⃣" }
                  },
                  {
                    label: "Option 3",
                    value: "option3",
                    description: "This is the third option",
                    emoji: { name: "3️⃣" }
                  }
                ]
              }
            ]
          },
          // Row 4: Role Select Menu
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.RoleSelect,
                custom_id: "role_select",
                placeholder: "Select roles...",
                min_values: 0,
                max_values: 5
              }
            ]
          },
          // Row 5: Channel Select Menu
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.ChannelSelect,
                custom_id: "channel_select",
                placeholder: "Select channels...",
                min_values: 1,
                max_values: 3,
                channel_types: [ChannelType.GuildText, ChannelType.GuildVoice]
              }
            ]
          }
        ]
      }
    };
  }
} satisfies Command;
