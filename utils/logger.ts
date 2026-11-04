import { env } from "@/lib/env";

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  message: string;
  error?: unknown;
  meta?: Record<string, any>;
}

const isProd = env.NODE_ENV === "production";

function formatError(error: unknown) {
  if ((error as any)["name"].startsWith("Prisma")) {
    // control prisma error log
    return {
      name: (error as any).name,
      message: (error as any).message,
      // stack: (error as any).stack,
    };
  } else if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

function log(level: LogLevel, payload: LogPayload) {
  const logData = {
    level,
    timestamp: new Date().toISOString(),
    message: payload.message,
    error: payload.error ? formatError(payload.error) : undefined,
    meta: payload.meta || {},
  };

  if (!isProd) {
    console[level](logData);
  } else {
    // 👉 Replace with external service in production
    console[level](logData);
  }
}

export const logger = {
  info: (payload: LogPayload) => log("info", payload),
  warn: (payload: LogPayload) => log("warn", payload),
  error: (payload: LogPayload) => log("error", payload),
};
