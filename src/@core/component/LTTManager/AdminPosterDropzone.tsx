"use client";

import { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";

export interface AdminPosterDropzoneProps {
    /** Remote/persisted URL (https or absolute path). */
    remoteUrl?: string;
    /** When user selects a file, preview uses blob URL internally until cleared. */
    selectedFile?: File | null;
    onPickFile: (file: File | null) => void;
    titleLabel: string;
    hintPrimary: string;
    hintSecondary: string;
    /** Tailwind aspect class; default matches manager movies poster. */
    aspectClassName?: string;
    disabled?: boolean;
}

/** Drag-target styled poster/image zone — same UX pattern as manager movies create/edit modal. */
export default function AdminPosterDropzone({
    remoteUrl = "",
    selectedFile,
    onPickFile,
    titleLabel,
    hintPrimary,
    hintSecondary,
    aspectClassName = "aspect-2/3",
    disabled = false,
}: AdminPosterDropzoneProps) {
    const [blobUrl, setBlobUrl] = useState("");

    useEffect(() => {
        if (!selectedFile) {
            setBlobUrl("");
            return;
        }
        const url = URL.createObjectURL(selectedFile);
        setBlobUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [selectedFile]);

    const previewUrl = blobUrl || remoteUrl.trim();

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onPickFile(null);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        onPickFile(file);
        event.target.value = "";
    };

    return (
        <div className="space-y-2">
            <LTTLabel>{titleLabel}</LTTLabel>
            <div
                className={`relative w-full max-w-[200px] rounded-lg border-2 border-dashed border-[#d9d9d9] bg-[#fafafa] transition-colors hover:border-primary-shadcn/50 overflow-hidden ${aspectClassName}`}
            >
                <input
                    type="file"
                    accept="image/*"
                    disabled={disabled}
                    className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                    onChange={handleInputChange}
                />
                {previewUrl ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute right-2 top-2 z-[60] flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex h-full min-h-[140px] flex-col items-center justify-center px-4 py-6 text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdecec] text-[#ef4444]">
                            <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-foreground-shadcn">{hintPrimary}</p>
                        <p className="mt-1 text-xs text-muted-foreground-shadcn">{hintSecondary}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
