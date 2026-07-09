type LogLevel = "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const suffix = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${suffix}`;
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.log(formatMessage("info", message, context));
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(formatMessage("warn", message, context));
  },
  error(message: string, context?: Record<string, unknown>) {
    console.error(formatMessage("error", message, context));
  },
};
