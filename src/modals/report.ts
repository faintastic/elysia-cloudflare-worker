import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import type { APIModalSubmitInteraction } from 'discord-api-types/v10';
import type { Modal } from '../lib/discord/loader';

export default {
  customId: "report",
  
  async execute(_interaction: APIModalSubmitInteraction, fields: Map<string, string>) {
    const reason = fields.get("report_reason");
    const details = fields.get("report_details");
    
    // Process the report (save to DB, notify moderators, etc.)
    console.log("Report submitted:", { reason, details });
    
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: "✅ Your report has been submitted to the moderation team.",
        flags: MessageFlags.Ephemeral
      }
    };
  }
} satisfies Modal;
