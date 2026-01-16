import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import type { APIModalSubmitInteraction } from 'discord-api-types/v10';
import type { Modal } from '../lib/discord/loader';

export default {
  customId: "feedback",
  
  async execute(_interaction: APIModalSubmitInteraction, fields: Map<string, string>) {
    const feedbackType = fields.get("feedback_type");
    const message = fields.get("feedback_message");
    
    // Here you would typically save this to a database or send to a logging channel
    console.log("Feedback received:", { feedbackType, message });
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `✅ Thank you for your feedback!\n\n**Type:** ${feedbackType || "Not specified"}\n**Message:** ${message || "No message"}`,
        flags: MessageFlags.Ephemeral
      }
    };
  }
} satisfies Modal;
