"use client";

import { LTTButton } from "./LTTShadcnUI/LTTButton";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogDescription,
    LTTDialogFooter,
    LTTDialogHeader,
    LTTDialogTitle,
} from "./LTTShadcnUI/LTTDialog";

type LTTUnsavedChangesDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    messageBefore: string;
    messageHighlight: string;
    messageAfter: string;
    stayText: string;
    exitText: string;
    onExit: () => void | Promise<void>;
    loading?: boolean;
};

const LTTUnsavedChangesDialog = ({
    open,
    onOpenChange,
    title,
    messageBefore,
    messageHighlight,
    messageAfter,
    stayText,
    exitText,
    onExit,
    loading = false,
}: LTTUnsavedChangesDialogProps) => {
    const handleExit = async () => {
        await onExit();
    };

    return (
        <LTTDialog open={open} onOpenChange={onOpenChange}>
            <LTTDialogContent className="sm:max-w-md">
                <LTTDialogHeader>
                    <LTTDialogTitle>{title}</LTTDialogTitle>
                    <LTTDialogDescription>
                        <span>{messageBefore} </span>
                        <span className="font-semibold text-foreground">{messageHighlight}</span>
                        <span> {messageAfter}</span>
                    </LTTDialogDescription>
                </LTTDialogHeader>
                <LTTDialogFooter>
                    <LTTButton variant="outline" onClick={() => onOpenChange(false)}>
                        {stayText}
                    </LTTButton>
                    <LTTButton variant="default" onClick={handleExit} loading={loading}>
                        {exitText}
                    </LTTButton>
                </LTTDialogFooter>
            </LTTDialogContent>
        </LTTDialog>
    );
};

export default LTTUnsavedChangesDialog;