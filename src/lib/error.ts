import { ZodError } from "zod";


export function handleError(error: any) {

    if (error['name'] === "PrismaClientKnownRequestError") {
        switch (error.code) {
            case "P2002":
                // Unique constraint failed
                return {
                    status: 409,
                    message: "Duplicate entry: a record with these fields already exists.",
                };
            case "P2003":
                // Foreign key constraint
                return {
                    status: 400,
                    message: "Cannot delete or update because it is referenced somewhere else.",
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

    if (error['name'] === "PrismaClientValidationError") {
        return {
            status: 400,
            message: "Invalid data sent to the database.",
        };
    }

    if (error['name'] === "PrismaClientInitializationError") {
        return {
            status: 500,
            message: "Database connection could not be initialized.",
        };
    }

    if (error instanceof ZodError) {
        return {
            status: 400,
            message: "Validation failed",
            details: error.format()
        };
    }

    if (error instanceof Error) {
        return {
            status: 500,
            message: error.message.split("\n").pop(),
        };
    }

    // Fallback
    return {
        status: 500,
        message: "Unexpected error occurred.",
    };
}