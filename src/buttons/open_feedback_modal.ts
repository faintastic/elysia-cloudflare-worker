import { InteractionResponseType, ComponentType, TextInputStyle } from 'discord-api-types/v10';
import type { APIMessageButtonInteractionData } from 'discord-api-types/v10';
import type { Button } from '../lib/discord/loader';

export default {
  customId: "open_feedback_modal",
  
  async execute(_interaction: APIMessageButtonInteractionData, _args?: string[]) {
    return {
      type: InteractionResponseType.Modal,
      data: {
        custom_id: "feedback",
        title: "Feedback Form",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                custom_id: "feedback_type",
                label: "Feedback Type",
                style: TextInputStyle.Short,
                placeholder: "Bug, Feature Request, General, etc.",
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
                custom_id: "feedback_message",
                label: "Your Feedback",
                style: TextInputStyle.Paragraph,
                placeholder: "Tell us what you think...",
                required: true,
                min_length: 10,
                max_length: 1000
              }
            ]
          }
        ]
      }
    };
  }
} satisfies Button;
