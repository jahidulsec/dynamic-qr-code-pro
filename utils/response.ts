import { unstable_rethrow } from "next/navigation";
import { logger } from "./logger";
import { handleError } from "./error";

const DEFAULT_SUCCESS_MESSAGE = "Success";
const DEFAULT_ERROR_MESSAGE = "Something went wrong";

export type ApiSuccess<T> = {
    success: true;
    message: string;
    data: T;
};

export type ApiList<T> = ApiSuccess<T[]> & {
    count: number;
};

export type ApiError = {
    success: false;
    message: string;
    data: null;
    count: 0;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
export type ApiListResponse<T> = ApiList<T> | ApiError;

const single = <T>({
    message = DEFAULT_SUCCESS_MESSAGE,
    data,
}: {
    message?: string;
    data: T;
}): ApiSuccess<T> => ({
    success: true,
    message,
    data,
});

const multi = <T>({
    message = DEFAULT_SUCCESS_MESSAGE,
    data,
    count,
}: {
    message?: string;
    data: T[];
    count: number;
}): ApiList<T> => ({
    success: true,
    message,
    data,
    count,
});

const error = ({ error }: { error: unknown }): ApiError => {
    // Next's own control flow (redirect, notFound, prerender bail-outs) isn't a failure
    unstable_rethrow(error);
    logger.error({ message: "Request failed", error });

    return {
        success: false,
        message: handleError(error).message ?? DEFAULT_ERROR_MESSAGE,
        data: null,
        count: 0,
    };
};

export const apiResponse = {
    single,
    multi,
    error,
};
