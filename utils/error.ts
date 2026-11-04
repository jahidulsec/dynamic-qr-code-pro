import { APIError } from "better-auth/api";
import z, { ZodError } from "zod";

export const DATABASE_UNREACHABLE_MESSAGE =
  "Can't reach the server right now. Please try again in a moment.";

// Prisma codes for a database that is down, unreachable or dropped the connection
const CONNECTION_ERROR_CODES = ["P1001", "P1002", "P1008", "P1017"];

export function handleError(error: any) {
  if (error["name"] === "PrismaClientKnownRequestError") {
    if (CONNECTION_ERROR_CODES.includes(error.code)) {
      return { status: 503, message: DATABASE_UNREACHABLE_MESSAGE };
    }

    switch (error.code) {
      case "P2002":
        // Unique constraint failed
        return {
          status: 409,
          message:
            "Duplicate entry: a record with these fields already exists.",
        };
      case "P2003":
        // Foreign key constraint
        return {
          status: 400,
          message:
            "Cannot delete or update because it is referenced somewhere else.",
        };
      case "P2025":
        // Record not found
        return {
          status: 404,
          message: "Requested item does not exist.",
        };
      default:
        return {
          status: 500,
          message: "Database error occurred (unexpected code).",
        };
    }
  }

  if (error["name"] === "PrismaClientValidationError") {
    return {
      status: 400,
      message: "Invalid data sent to the database.",
    };
  }

  if (error["name"] === "PrismaClientInitializationError") {
    return {
      status: 503,
      message: DATABASE_UNREACHABLE_MESSAGE,
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      message:
        "Validation failed: " +
        error.issues?.[0].path.join(",") + " - " +
        error.issues?.[0].message,
      details: z.treeifyError(error),
    };
  }

  // Better Auth messages are written for users; other errors may expose internals
  if (error instanceof APIError) {
    return {
      status: error.statusCode,
      message: error.message,
    };
  }

  // Fallback
  return {
    status: 500,
    message: "Unexpected error occurred.",
  };
}
