"use client";

import React, { useEffect } from "react";
import { toast } from "sonner";

const ErrorBoundary = ({
    children,
    message,
}: React.PropsWithChildren & { message: string | undefined }) => {
    const errorRef = React.useRef<string | undefined>(undefined);

    useEffect(() => {
        if (message && !errorRef.current) {
            toast.error(message);
            errorRef.current = message;
        }
    }, [message]);

    return <>{children}</>;
};

export { ErrorBoundary };