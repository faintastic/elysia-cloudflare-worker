import { InteractionResponseType, ComponentType, TextInputStyle } from 'discord-api-types/v10';
import type { APIMessageButtonInteractionData } from 'discord-api-types/v10';
import type { Button } from '../lib/discord/loader';

export default {
  customId: "test_modal_open",
  
  async execute(_interaction: APIMessageButtonInteractionData, _args?: string[]) {
    return {
      type: InteractionResponseType.Modal,
      data: {
        custom_id: "test_modal",
        title: "Test Form",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: "test_name",
                label: "Your Name",
                style: TextInputStyle.Short,
                placeholder: "Enter your name...",
                required: true,
                max_length: 50
              }
            ]
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: "test_message",
                label: "Your Message",
                style: TextInputStyle.Paragraph,
                placeholder: "Enter your message...",
                required: true,
                max_length: 500
              }
            ]
          }
        ]
      }
    };
  }
} satisfies Button;
