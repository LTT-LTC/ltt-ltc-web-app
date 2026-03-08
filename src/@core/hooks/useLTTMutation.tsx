import { useRef, useState } from "react";

type LTTMutationProps<LTTOutputType, LTTInputType> = {
    onSuccess?: (res: LTTOutputType | null) => void;
    onError?: (error: any) => void;
    mutationFn: (input: LTTInputType) => Promise<LTTOutputType | null>;
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
            if (onError) onError(error);
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