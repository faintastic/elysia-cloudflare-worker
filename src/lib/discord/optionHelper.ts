/**
 * Command Option Helper Utilities
 * 
 * This module provides type-safe helper functions for extracting option values from
 * Discord slash command interactions. Each function handles a specific option type
 * and returns undefined if the option is not found or has an invalid type.
 * 
 * @module optionHelper
 */

import type { APIApplicationCommandInteractionDataOption } from 'discord-api-types/v10';

/**
 * Get a specific option from the options array by name.
 * 
 * This is the base function used by all other option getters. It finds an option
 * by name but does not perform type checking.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the option to find
 * @returns The option object if found, undefined otherwise
 * 
 * @internal
 */
export function getOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): APIApplicationCommandInteractionDataOption | undefined {
  return options?.find(opt => opt.name === name);
}

/**
 * Get a string option value from command options.
 * 
 * Safely extracts a string value from the options array. Returns undefined if
 * the option doesn't exist or has an incorrect type.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the string option to retrieve
 * @returns The string value if found and valid, undefined otherwise
 * 
 * @example
 * ```ts
 * const message = getStringOption(interaction.data.options, 'message');
 * if (message) {
 *   console.log(`User said: ${message}`);
 * }
 * ```
 */
export function getStringOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): string | undefined {
  const option = getOption(options, name);
  return option && 'value' in option && typeof option.value === 'string' 
    ? option.value 
    : undefined;
}

/**
 * Get an integer option value from command options.
 * 
 * Safely extracts an integer value, ensuring it's floored to a whole number.
 * Returns undefined if the option doesn't exist or has an incorrect type.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the integer option to retrieve
 * @returns The integer value if found and valid, undefined otherwise
 * 
 * @example
 * ```ts
 * const count = getIntegerOption(interaction.data.options, 'count');
 * if (count !== undefined) {
 *   console.log(`Count: ${count}`);
 * }
 * ```
 */
export function getIntegerOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): number | undefined {
  const option = getOption(options, name);
  return option && 'value' in option && typeof option.value === 'number' 
    ? Math.floor(option.value) 
    : undefined;
}

/**
 * Get a number option value (can include decimals) from command options.
 * 
 * Safely extracts a numeric value which may include decimal places.
 * Returns undefined if the option doesn't exist or has an incorrect type.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the number option to retrieve
 * @returns The number value if found and valid, undefined otherwise
 * 
 * @example
 * ```ts
 * const price = getNumberOption(interaction.data.options, 'price');
 * if (price !== undefined) {
 *   console.log(`Price: $${price.toFixed(2)}`);
 * }
 * ```
 */
export function getNumberOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): number | undefined {
  const option = getOption(options, name);
  return option && 'value' in option && typeof option.value === 'number' 
    ? option.value 
    : undefined;
}

/**
 * Get a boolean option value from command options.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the boolean option to retrieve
 * @returns The boolean value if found and valid, undefined otherwise
 * 
 * @example
 * ```ts
 * const isPublic = getBooleanOption(interaction.data.options, 'public');
 * const flags = isPublic ? 0 : 64; // 64 = ephemeral
 * ```
 */
export function getBooleanOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): boolean | undefined {
  const option = getOption(options, name);
  return option && 'value' in option && typeof option.value === 'boolean' 
    ? option.value 
    : undefined;
}

/**
 * Get a user option value from command options.
 * 
 * Returns the user's ID (snowflake string). To get full user data, look up the user
 * in interaction.data.resolved.users using this ID.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the user option to retrieve
 * @returns The user ID if found and valid, undefined otherwise
 * 
 * @example
 * ```ts
 * const userId = getUserOption(interaction.data.options, 'target');
 * const user = interaction.data.resolved?.users?.[userId];
 * ```
 */
export function getUserOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): string | undefined {
  const option = getOption(options, name);
  return option && 'value' in option && typeof option.value === 'string' 
    ? option.value 
    : undefined;
}

/**
 * Get a channel option value from command options.
 * 
 * Returns the channel's ID (snowflake string). To get full channel data, look up the channel
 * in interaction.data.resolved.channels using this ID.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the channel option to retrieve
 * @returns The channel ID if found and valid, undefined otherwise
 * 
 * @example
 * ```ts
 * const channelId = getChannelOption(interaction.data.options, 'channel');
 * const channel = interaction.data.resolved?.channels?.[channelId];
 * ```
 */
export function getChannelOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): string | undefined {
  const option = getOption(options, name);
  return option && 'value' in option && typeof option.value === 'string' 
    ? option.value 
    : undefined;
}

/**
 * Get a role option value from command options.
 * 
 * Returns the role's ID (snowflake string). To get full role data, look up the role
 * in interaction.data.resolved.roles using this ID.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the role option to retrieve
 * @returns The role ID if found and valid, undefined otherwise
 * 
 * @example
 * ```ts
 * const roleId = getRoleOption(interaction.data.options, 'role');
 * const role = interaction.data.resolved?.roles?.[roleId];
 * ```
 */
export function getRoleOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): string | undefined {
  const option = getOption(options, name);
  return option && 'value' in option && typeof option.value === 'string' 
    ? option.value 
    : undefined;
}

/**
 * Get a mentionable option value from command options.
 * 
 * Returns the ID of either a user or role (snowflake string). Check
 * interaction.data.resolved to determine if it's a user or role and get full data.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the mentionable option to retrieve
 * @returns The user or role ID if found and valid, undefined otherwise
 * 
 * @example
 * ```ts
 * const id = getMentionableOption(interaction.data.options, 'target');
 * const user = interaction.data.resolved?.users?.[id];
 * const role = interaction.data.resolved?.roles?.[id];
 * ```
 */
export function getMentionableOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): string | undefined {
  const option = getOption(options, name);
  return option && 'value' in option && typeof option.value === 'string' 
    ? option.value 
    : undefined;
}

/**
 * Get an attachment option value from command options.
 * 
 * Returns the attachment's ID (snowflake string). To get full attachment data, look up
 * the attachment in interaction.data.resolved.attachments using this ID.
 * 
 * @param options - The options array from the interaction data
 * @param name - The name of the attachment option to retrieve
 * @returns The attachment ID if found and valid, undefined otherwise
 * 
 * @example
 * ```ts
 * const attachmentId = getAttachmentOption(interaction.data.options, 'file');
 * const attachment = interaction.data.resolved?.attachments?.[attachmentId];
 * if (attachment) {
 *   console.log(`File URL: ${attachment.url}`);
 * }
 * ```
 */
export function getAttachmentOption(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  name: string
): string | undefined {
  const option = getOption(options, name);
  return option && 'value' in option && typeof option.value === 'string' 
    ? option.value 
    : undefined;
}

/**
 * Get the active subcommand name from command options.
 * 
 * When a command has subcommands, this returns the name of the subcommand that was invoked.
 * 
 * @param options - The options array from the interaction data
 * @returns The subcommand name if present, undefined otherwise
 * 
 * @example
 * ```ts
 * const subcommand = getSubcommand(interaction.data.options);
 * if (subcommand === 'list') {
 *   // Handle list subcommand
 * } else if (subcommand === 'add') {
 *   // Handle add subcommand
 * }
 * ```
 */
export function getSubcommand(
  options: APIApplicationCommandInteractionDataOption[] | undefined
): string | undefined {
  const subcommand = options?.find(opt => opt.type === 1); // Subcommand type
  return subcommand?.name;
}

/**
 * Get the active subcommand group name from command options.
 * 
 * When a command has subcommand groups, this returns the name of the group that was selected.
 * 
 * @param options - The options array from the interaction data
 * @returns The subcommand group name if present, undefined otherwise
 * 
 * @example
 * ```ts
 * const group = getSubcommandGroup(interaction.data.options);
 * const subcommand = getSubcommand(interaction.data.options);
 * // Example: /config user set -> group="user", subcommand="set"
 * ```
 */
export function getSubcommandGroup(
  options: APIApplicationCommandInteractionDataOption[] | undefined
): string | undefined {
  const group = options?.find(opt => opt.type === 2); // SubcommandGroup type
  return group?.name;
}

/**
 * Get options from a subcommand
 */
export function getSubcommandOptions(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  subcommandName: string
): APIApplicationCommandInteractionDataOption[] | undefined {
  const subcommand = options?.find(opt => opt.type === 1 && opt.name === subcommandName);
  return subcommand && 'options' in subcommand ? subcommand.options : undefined;
}

/**
 * Get options from a subcommand within a subcommand group
 */
export function getSubcommandGroupOptions(
  options: APIApplicationCommandInteractionDataOption[] | undefined,
  groupName: string,
  subcommandName: string
): APIApplicationCommandInteractionDataOption[] | undefined {
  const group = options?.find(opt => opt.type === 2 && opt.name === groupName);
  if (!group || !('options' in group)) return undefined;
  
  const subcommand = group.options?.find(opt => opt.type === 1 && opt.name === subcommandName);
  return subcommand && 'options' in subcommand ? subcommand.options : undefined;
}
