import chalk from "chalk";
import type { ChalkInstance } from "chalk";

type LogTypes = "info" | "warn" | "error" | "debug" | "success" | "fatal" | "trace"; 

export default class log {
  /**
   * Get the current timestamp in HH:MM:SS.mmm format.
   * @returns Formatted timestamp string.
   */
  private static timestamp(): string {
    const now = new Date();

    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const milliseconds = now.getMilliseconds().toString().padStart(3, "0");

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  /**
   * Get styles for different log levels.
   * @param level - Log level.
   * @returns Object containing label and styles for the log level.
   */
  private static levelStyles(level: LogTypes): { label: string, style: ChalkInstance, messageStyle?: ChalkInstance } {
    const styles: Record<LogTypes, { label: string, style: ChalkInstance, messageStyle?: ChalkInstance }> = {
      info: { label: "INFO", style: chalk.cyan },
      warn: { label: "WARN", style: chalk.yellow },
      error: { label: "ERROR", style: chalk.red },
      debug: { label: "DEBUG", style: chalk.green },
      success: { label: "SUCCESS", style: chalk.green },
      fatal: { label: "FATAL", style: chalk.red.bold.bgBlack, messageStyle: chalk.white.bold.bgRed },
      trace: { label: "TRACE", style: chalk.magenta, messageStyle: chalk.gray },
    };

    return styles[level];
  }

  /**
   * Log a message with a specific log level.
   * @param level - The log level type (info, warn, error, debug, success, fatal, trace).
   * @param message - The message to log.
   * @param area - Optional area/context to categorize the log (e.g., "orders", "payments").
   */
  public static log({ level, message, area }: { level: LogTypes, message: string, area?: string }): void {
    const timestamp = chalk.gray(`${this.timestamp()}`);
    const { label, style, messageStyle } = this.levelStyles(level);
    const formattedLevel = style(label.padEnd(5, " "));
    const areaString = area ? chalk.gray(`[${area}]`) : "";
    
    console.log(`${timestamp}\t${formattedLevel}\t${areaString}${areaString ? " " : ""}${messageStyle ? messageStyle(message) : message}`);
  }

  /**
   * Log an informational message.
   * @param message - The message to log.
   * @param area - Optional area/context to categorize the log.
   */
  public static info(message: string, area?: string): void {
    this.log({ level: "info", message, area });
  }

  /**
   * Log a warning message.
   * @param message - The message to log.
   * @param area - Optional area/context to categorize the log.
   */
  public static warn(message: string, area?: string): void {
    this.log({ level: "warn", message, area });
  }

  /**
   * Log an error message.
   * @param message - The message to log.
   * @param area - Optional area/context to categorize the log.
   */
  public static error(message: string, area?: string): void {
    this.log({ level: "error", message, area });
  }

  /**
   * Log a debug message.
   * @param message - The message to log.
   * @param area - Optional area/context to categorize the log.
   */
  public static debug(message: string, area?: string): void {
    this.log({ level: "debug", message, area });
  }

  /**
   * Log a success message.
   * @param message - The message to log.
   * @param area - Optional area/context to categorize the log.
   */
  public static success(message: string, area?: string): void {
    this.log({ level: "success", message, area });
  }

  /**
   * Log a fatal error message with emphasized styling.
   * @param message - The message to log.
   * @param area - Optional area/context to categorize the log.
   */
  public static fatal(message: string, area?: string): void {
    this.log({ level: "fatal", message, area });
  }

  /**
   * Log a trace message for detailed debugging.
   * @param message - The message to log.
   * @param area - Optional area/context to categorize the log.
   */
  public static trace(message: string, area?: string): void {
    this.log({ level: "trace", message, area });
  }
}