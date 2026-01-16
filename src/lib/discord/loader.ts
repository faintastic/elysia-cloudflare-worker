/**
 * Interaction Handler Loader
 * 
 * This module provides a unified loader system for all Discord interaction handlers including:
 * - Slash commands with full SlashCommandBuilder feature parity
 * - Button interactions with dynamic custom IDs
 * - Modal submissions with field extraction
 * - Select menus (all types: String, User, Role, Channel, Mentionable)
 * 
 * The loader automatically scans designated directories and imports all handler modules,
 * storing them in Maps for fast lookup during interaction routing.
 * 
 * @module loader
 */

import type { 
  APIMessageButtonInteractionData, 
  APIMessageSelectMenuInteractionData, 
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ChannelType,
  LocalizationMap,
  APIModalSubmitInteraction,
  APIApplicationCommandInteraction
} from "discord-api-types/v10";
import log from "../log";

/**
 * Type definitions for interaction handlers.
 * 
 * Each handler type follows a consistent pattern with:
 * - A unique identifier (name/customId)
 * - Optional cooldown in seconds
 * - An async execute function that handles the interaction
 */
/**
 * Button interaction handler definition.
 */
export interface Button {
  /** The base custom ID for this button (can be used with dynamic args) */
  customId: string;
  /** Optional cooldown in seconds before the button can be used again */
  cooldown?: number;
  /** Handler function called when the button is clicked */
  execute: (interaction: APIMessageButtonInteractionData, args?: string[]) => Promise<any>;
}

/**
 * Modal submission handler definition.
 */
export interface Modal {
  /** The base custom ID for this modal (can be used with dynamic args) */
  customId: string; 
  /** Optional cooldown in seconds before the modal can be submitted again */
  cooldown?: number;
  /** Handler function called when the modal is submitted */
  execute: (interaction: APIModalSubmitInteraction, fields: Map<string, string>) => Promise<any>;
}

/**
 * Select menu handler definition (works with all select menu types).
 */
export interface Select {
  /** The base custom ID for this select menu (can be used with dynamic args) */
  customId: string;
  /** Optional cooldown in seconds before the select menu can be used again */
  cooldown?: number;
  /** Handler function called when the select menu is used */
  execute: (interaction: APIMessageSelectMenuInteractionData, values: string[]) => Promise<any>;
}

/**
 * Command option definition (mirrors SlashCommandBuilder options).
 */
export interface CommandOption {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  name_localizations?: LocalizationMap;
  description_localizations?: LocalizationMap;
  required?: boolean;
  choices?: CommandOptionChoice[];
  options?: CommandOption[]; // For subcommands and subcommand groups
  channel_types?: ChannelType[];
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
  autocomplete?: boolean;
}

export interface CommandOptionChoice {
  name: string;
  name_localizations?: LocalizationMap;
  value: string | number;
}

/**
 * Slash command definition with full SlashCommandBuilder feature parity.
 */
export interface Command {
  /** Command name (must be lowercase, no spaces) */
  name: string;
  /** Command description */
  description: string;
  /** Localized command names for different languages */
  name_localizations?: LocalizationMap;
  /** Localized descriptions for different languages */
  description_localizations?: LocalizationMap;
  /** Command type (defaults to CHAT_INPUT/1) */
  type?: ApplicationCommandType;
  /** Command options (arguments, subcommands, etc.) */
  options?: CommandOption[];
  /** Required permissions to use this command (bitfield string) */
  default_member_permissions?: string | null;
  /** Whether the command can be used in DMs */
  dm_permission?: boolean;
  /** Whether this command is age-restricted (NSFW) */
  nsfw?: boolean;
  /** Optional cooldown in seconds before the command can be used again */
  cooldown?: number;
  /** Handler function called when the command is invoked */
  execute: (interaction: APIApplicationCommandInteraction) => Promise<any>;
}

/**
 * Unified loader for all Discord interaction handlers.
 * 
 * Provides a centralized system for loading and managing commands, buttons, modals,
 * and select menus. Supports both dynamic loading (for development with Bun) and
 * static loading (for Cloudflare Workers deployment).
 * 
 * @example
 * ```ts
 * // Dynamic loading (development)
 * const loader = new InteractionLoader();
 * await loader.loadAll();
 * 
 * // Static loading (Cloudflare Workers)
 * const loader = new InteractionLoader();
 * await loader.loadFromManifest();
 * 
 * const command = loader.getCommand('ping');
 * const button = loader.getButton('confirm');
 * ```
 */
export class InteractionLoader {
  private commands: Map<string, Command> = new Map();
  private buttons: Map<string, Button> = new Map();
  private modals: Map<string, Modal> = new Map();
  private selects: Map<string, Select> = new Map();

  /**
   * Load handlers from a static manifest (for Cloudflare Workers).
   * 
   * This method loads handlers from explicitly imported modules, which works
   * in bundled environments like Cloudflare Workers where file system access
   * and dynamic imports are not available.
   * 
   * @returns This loader instance for method chaining
   */
  async loadFromManifest() {
    try {
      const { commands, buttons, modals, selects } = await import('./manifest');
      
      // Load commands
      for (const command of commands) {
        if (command?.name && typeof command?.execute === 'function') {
          this.commands.set(command.name, command);
          log.info(`Loaded command: ${command.name}`);
        }
      }
      log.info(`Successfully loaded ${this.commands.size} command(s) from manifest`);
      
      // Load buttons
      for (const button of buttons) {
        if (button?.customId && typeof button?.execute === 'function') {
          this.buttons.set(button.customId, button);
          log.info(`Loaded button: ${button.customId}`);
        }
      }
      log.info(`Successfully loaded ${this.buttons.size} button(s) from manifest`);
      
      // Load modals
      for (const modal of modals) {
        if (modal?.customId && typeof modal?.execute === 'function') {
          this.modals.set(modal.customId, modal);
          log.info(`Loaded modal: ${modal.customId}`);
        }
      }
      log.info(`Successfully loaded ${this.modals.size} modal(s) from manifest`);
      
      // Load selects
      for (const select of selects) {
        if (select?.customId && typeof select?.execute === 'function') {
          this.selects.set(select.customId, select);
          log.info(`Loaded select menu: ${select.customId}`);
        }
      }
      log.info(`Successfully loaded ${this.selects.size} select menu(s) from manifest`);
      
    } catch (error) {
      log.error(`Failed to load from manifest: ${(error as Error).message}`);
    }
    
    return this;
  }

  /**
   * Load all interaction handlers in parallel (dynamic loading for development).
   * 
   * This method uses file system scanning and works in Bun development environment.
   * For Cloudflare Workers, use loadFromManifest() instead.
   * 
   * @returns This loader instance for method chaining
   */
  async loadAll() {
    // Check if we're in Cloudflare Workers environment
    if (typeof Bun === 'undefined') {
      log.info('Bun not available, using static manifest loading');
      return this.loadFromManifest();
    }
    
    await Promise.all([
      this.loadCommands(),
      this.loadButtons(),
      this.loadModals(),
      this.loadSelects()
    ]);
    return this;
  }

  /**
   * Load all command handlers from the commands directory.
   * 
   * Scans the commands directory for .ts and .js files, imports each one,
   * and validates the command structure before storing it.
   * 
   * @returns This loader instance for method chaining
   */
  async loadCommands() {
    try {
      const glob = new Bun.Glob("*.{ts,js}");
      const commandsPath = new URL("../../commands/", import.meta.url).pathname;
      
      for await (const file of glob.scan({ cwd: commandsPath })) {
        if (file.endsWith('.md')) continue; // Skip markdown files
        
        const filePath = `${commandsPath}${file}`;
        
        try {
          const mod = await import(filePath);
          const command = mod.default;

          if (command?.name && typeof command?.execute === 'function') {
            this.commands.set(command.name, command);
            log.info(`Loaded command: ${command.name} (${file})`);
          } else {
            log.warn(`Invalid command structure in ${file}`);
          }
        } catch (error) {
          log.error(`Failed to load command ${file}: ${(error as Error).message}`);
        }
      }

      log.info(`Successfully loaded ${this.commands.size} command(s)`);
    } catch (error) {
      log.error(`Failed to load commands: ${(error as Error).message}`);
    }

    return this;
  }

  async loadButtons() {
    try {
      const glob = new Bun.Glob("*.{ts,js}");
      const buttonsPath = new URL("../../buttons/", import.meta.url).pathname;
      
      for await (const file of glob.scan({ cwd: buttonsPath })) {
        const filePath = `${buttonsPath}${file}`;
        
        try {
          const mod = await import(filePath);
          const button = mod.default;

          if (button?.customId && typeof button?.execute === 'function') {
            this.buttons.set(button.customId, button);
            log.info(`Loaded button: ${button.customId} (${file})`);
          } else {
            log.warn(`Invalid button structure in ${file}`);
          }
        } catch (error) {
          log.error(`Failed to load button ${file}: ${(error as Error).message}`);
        }
      }

      log.info(`Successfully loaded ${this.buttons.size} button(s)`);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        log.error(`Failed to load buttons: ${(error as Error).message}`);
      }
    }

    return this;
  }

  async loadModals() {
    try {
      const glob = new Bun.Glob("*.{ts,js}");
      const modalsPath = new URL("../../modals/", import.meta.url).pathname;
      
      for await (const file of glob.scan({ cwd: modalsPath })) {
        const filePath = `${modalsPath}${file}`;
        
        try {
          const mod = await import(filePath);
          const modal = mod.default;

          if (modal?.customId && typeof modal?.execute === 'function') {
            this.modals.set(modal.customId, modal);
            log.info(`Loaded modal: ${modal.customId} (${file})`);
          } else {
            log.warn(`Invalid modal structure in ${file}`);
          }
        } catch (error) {
          log.error(`Failed to load modal ${file}: ${(error as Error).message}`);
        }
      }

      log.info(`Successfully loaded ${this.modals.size} modal(s)`);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        log.error(`Failed to load modals: ${(error as Error).message}`);
      }
    }

    return this;
  }

  async loadSelects() {
    try {
      const glob = new Bun.Glob("*.{ts,js}");
      const selectsPath = new URL("../../select-menus/", import.meta.url).pathname;
      
      for await (const file of glob.scan({ cwd: selectsPath })) {
        const filePath = `${selectsPath}${file}`;
        
        try {
          const mod = await import(filePath);
          const select = mod.default;

          if (select?.customId && typeof select?.execute === 'function') {
            this.selects.set(select.customId, select);
            log.info(`Loaded select menu: ${select.customId} (${file})`);
          } else {
            log.warn(`Invalid select menu structure in ${file}`);
          }
        } catch (error) {
          log.error(`Failed to load select menu ${file}: ${(error as Error).message}`);
        }
      }

      log.info(`Successfully loaded ${this.selects.size} select menu(s)`);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        log.error(`Failed to load select menus: ${(error as Error).message}`);
      }
    }

    return this;
  }

  /**
   * Get a command handler by name.
   * @param name - The command name
   * @returns The command handler if found, undefined otherwise
   */
  getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Get all loaded command handlers.
   * @returns Array of all command handlers
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get all command names.
   * @returns Array of command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Get a button handler by custom ID.
   * @param customId - The button's custom ID (base ID without args)
   * @returns The button handler if found, undefined otherwise
   */
  getButton(customId: string): Button | undefined {
    return this.buttons.get(customId);
  }

  /**
   * Get all loaded button handlers.
   * @returns Array of all button handlers
   */
  getAllButtons(): Button[] {
    return Array.from(this.buttons.values());
  }

  /**
   * Get a modal handler by custom ID.
   * @param customId - The modal's custom ID (base ID without args)
   * @returns The modal handler if found, undefined otherwise
   */
  getModal(customId: string): Modal | undefined {
    return this.modals.get(customId);
  }

  /**
   * Get all loaded modal handlers.
   * @returns Array of all modal handlers
   */
  getAllModals(): Modal[] {
    return Array.from(this.modals.values());
  }

  // Select menu getters
  getSelect(customId: string): Select | undefined {
    return this.selects.get(customId);
  }

  getAllSelects(): Select[] {
    return Array.from(this.selects.values());
  }
}

export const loader = new InteractionLoader();