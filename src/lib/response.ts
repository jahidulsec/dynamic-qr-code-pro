import { handleError } from "./error"

export const response = <T>({ success, message, data }: { success: boolean, message: string, data?: T }) => {
    return {
        success: success, message: message, data: data
    }
}

const multi = <T>({ message, data, count }: { message?: string, data: T[], count: number }) => {
    return {
        success: true, message, data, count
    }
}

const single = <T>({ message, data }: { message?: string, data: T }) => {
    return {
        success: true, message, data
    }
}

const error = ({ error }: { error: unknown }) => {
    const err = handleError(error)

    return {
        success: false, message: err.message ?? 'Something went wrong', data: null, count: 0
    }
}

export const apiResponse = {
    single, multi, error
}



