import { useRef, useState } from "react";
import { translate } from "../utils/localization";

type LTTMutationProps<LTTOutputType, LTTInputType> = {
    onSuccess?: (res: LTTOutputType | null) => void;
    onError?: (error: any) => void;
    mutationFn: (input: LTTInputType) => Promise<LTTOutputType | null>;
};

const normalizeMutationError = (error: unknown) => {
    if (error && typeof error === "object") {
        const message = "message" in error ? (error as { message?: unknown }).message : undefined;
        if (typeof message === "string" && message.trim()) {
            return error;
        }

        const nestedMessage = "error" in error && typeof (error as { error?: unknown }).error === "object"
            ? ((error as { error?: { message?: unknown } }).error?.message)
            : undefined;

        if (typeof nestedMessage === "string" && nestedMessage.trim()) {
            return { ...(error as Record<string, unknown>), message: nestedMessage };
        }
    }

    if (typeof error === "string" && error.trim()) {
        return { message: error };
    }

    return { message: translate("http.unknown_error", "Có lỗi xảy ra, vui lòng thử lại.") };
};

const useLTTMutation = <LTTOutputType, LTTInputType = void>({
    mutationFn,
    onSuccess,
    onError,
}: LTTMutationProps<LTTOutputType, LTTInputType>) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isInitLoading, setIsInitLoading] = useState<boolean>(false);
    const [input, setInput] = useState<LTTInputType | null>(null);
    const [output, setOutput] = useState<LTTOutputType | null>(null);
    const isLoaded = useRef<boolean>(false);

    const mutation = async (input: LTTInputType) => {
        setIsLoading(true);
        if (!isLoaded.current) setIsInitLoading(true);

        try {
            const response = await mutationFn(input);
            setOutput(response);
            setInput(input);
            if (onSuccess) onSuccess(response);
        } catch (error) {
            if (onError) onError(normalizeMutationError(error));
        } finally {
            setIsLoading(false);
            if (!isLoaded.current) {
                setIsInitLoading(false);
                isLoaded.current = true;
            }
        }
    };

    return {
        mutation,
        isLoading,
        isInitLoading,
        input,
        data: output,
    };
};

export default useLTTMutation;