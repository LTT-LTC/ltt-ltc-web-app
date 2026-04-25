"use client";

import { useState, type ReactElement } from "react";
import {
    LTTDialog,
    LTTDialogContent,
    LTTDialogDescription,
    LTTDialogFooter,
    LTTDialogHeader,
    LTTDialogTitle,
    LTTDialogTrigger,
} from "./LTTShadcnUI/LTTDialog";
import { LTTButton } from "./LTTShadcnUI/LTTButton";

type LTTConfirmDialogProps = {
    trigger: ReactElement;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void | Promise<void>;
    confirmVariant?: "default" | "destructive";
    loading?: boolean;
};

const LTTConfirmDialog = ({
    trigger,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    confirmVariant = "destructive",
    loading = false,
}: LTTConfirmDialogProps) => {
    const [open, setOpen] = useState(false);

    const handleConfirm = async () => {
        await onConfirm();
        setOpen(false);
    };

    return (
        <LTTDialog open={open} onOpenChange={setOpen}>
            <LTTDialogTrigger asChild>
                {trigger}
            </LTTDialogTrigger>
            <LTTDialogContent className="sm:max-w-md">
                <LTTDialogHeader>
                    <LTTDialogTitle>{title}</LTTDialogTitle>
                    <LTTDialogDescription>{description}</LTTDialogDescription>
                </LTTDialogHeader>
                <LTTDialogFooter>
                    <LTTButton variant="outline" onClick={() => setOpen(false)}>
                        {cancelText}
                    </LTTButton>
                    <LTTButton variant={confirmVariant} onClick={handleConfirm} loading={loading}>
                        {confirmText}
                    </LTTButton>
                </LTTDialogFooter>
            </LTTDialogContent>
        </LTTDialog>
    );
};

export default LTTConfirmDialog;