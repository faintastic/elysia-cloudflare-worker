import type { 
  APIMessageComponentInteraction,
  APIModalSubmitInteraction,
  APITextInputComponent
} from 'discord-api-types/v10';

/**
 * Component Helper Utilities
 * 
 * This module provides helper functions for parsing and extracting data from Discord component interactions.
 * It handles buttons, select menus (all types), and modal submissions with support for dynamic custom IDs.
 * 
 * @module componentHelper
 */

/**
 * Parse a custom ID that may contain arguments separated by colons.
 * 
 * Custom IDs in Discord can be structured with a base identifier followed by dynamic arguments
 * separated by colons. This function splits the custom ID and returns the base ID and arguments.
 * 
 * @param customId - The full custom ID string from the interaction
 * @returns An object containing the base ID and an array of argument strings
 * 
 * @example
 * ```ts
 * parseCustomId("delete:messageId:userId")
 * // Returns: { id: "delete", args: ["messageId", "userId"] }
 * 
 * parseCustomId("simple_button")
 * // Returns: { id: "simple_button", args: [] }
 * ```
 */
export function parseCustomId(customId: string): { id: string; args: string[] } {
  const parts = customId.split(':');
  return {
    id: parts[0] || '',
    args: parts.slice(1)
  };
}

/**
 * Extract all text input field values from a modal submit interaction.
 * 
 * Iterates through all action rows and components in the modal submission to find text input fields,
 * then returns their custom IDs and values in a Map for easy lookup.
 * 
 * @param interaction - The modal submit interaction from Discord
 * @returns A Map where keys are field custom_ids and values are the user's input strings
 * 
 * @example
 * ```ts
 * const fields = extractModalFields(interaction);
 * const username = fields.get('username_field');
 * const reason = fields.get('reason_field');
 * ```
 */
export function extractModalFields(interaction: APIModalSubmitInteraction): Map<string, string> {
  const fields = new Map<string, string>();
  
  if (!interaction.data.components) {
    return fields;
  }
  
  for (const actionRow of interaction.data.components as any[]) {
    if (!actionRow.components) continue;
    
    for (const component of actionRow.components as any[]) {
      if (component.type === 4) { // TextInput type
        const textInput = component as APITextInputComponent;
        if (textInput.custom_id && textInput.value) {
          fields.set(textInput.custom_id, textInput.value);
        }
      }
    }
  }
  
  return fields;
}

/**
 * Extract the selected values from any type of select menu interaction.
 * 
 * Works with all Discord select menu types:
 * - String select menus
 * - User select menus (returns user IDs)
 * - Role select menus (returns role IDs)
 * - Channel select menus (returns channel IDs)
 * - Mentionable select menus (returns user or role IDs)
 * 
 * @param interaction - The message component interaction from Discord
 * @returns An array of selected value strings (IDs for entity select menus)
 * 
 * @example
 * ```ts
 * const values = extractSelectValues(interaction);
 * // For string select: ["option1", "option2"]
 * // For user select: ["123456789", "987654321"]
 * ```
 */
export function extractSelectValues(interaction: APIMessageComponentInteraction): string[] {
  if ('values' in interaction.data) {
    return interaction.data.values;
  }
  return [];
}

/**
 * Check if a custom ID matches a base pattern, ignoring dynamic arguments.
 * 
 * This is useful when you have dynamic custom IDs with arguments but want to match
 * against the base handler ID. It checks for exact match or a match followed by a colon.
 * 
 * @param fullCustomId - The complete custom ID from the interaction (may include args)
 * @param baseId - The base ID to match against (without arguments)
 * @returns True if the full custom ID matches the base ID or starts with "baseId:"
 * 
 * @example
 * ```ts
 * matchesCustomId("delete:123:456", "delete")  // true
 * matchesCustomId("delete", "delete")          // true
 * matchesCustomId("cancel:123", "delete")      // false
 * ```
 */
export function matchesCustomId(fullCustomId: string, baseId: string): boolean {
  return fullCustomId === baseId || fullCustomId.startsWith(`${baseId}:`);
}

/**
 * Build a dynamic custom ID by combining a base ID with arguments.
 * 
 * Creates a colon-separated custom ID string that can be parsed later using parseCustomId().
 * This is useful for creating buttons or other components that need to store contextual data.
 * 
 * @param baseId - The base identifier for the component handler
 * @param args - Variable number of argument strings to append
 * @returns A colon-separated custom ID string
 * 
 * @example
 * ```ts
 * buildCustomId("delete", "messageId", "userId")
 * // Returns: "delete:messageId:userId"
 * 
 * buildCustomId("confirm", "123")
 * // Returns: "confirm:123"
 * 
 * buildCustomId("simple")
 * // Returns: "simple"
 * ```
 */
export function buildCustomId(baseId: string, ...args: string[]): string {
  if (args.length === 0) {
    return baseId;
  }
  return `${baseId}:${args.join(':')}`;
}
