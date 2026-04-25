import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { ImageIcon } from "lucide-react";

import { cn } from "@/src/@core/utils/cn";

export interface LTTAvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
    src?: string;
    alt?: string;
    fallbackText?: string;
    size?: number;
    shape?: "circle" | "square";
    className?: string;
    imageClassName?: string;
    fallbackClassName?: string;
}

const getInitials = (value?: string) => {
    if (!value) {
        return "";
    }

    return value
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((item) => item[0])
        .join("")
        .toUpperCase();
};

const LTTAvatar = ({
    src,
    alt,
    fallbackText,
    size = 48,
    shape = "circle",
    className,
    imageClassName,
    fallbackClassName,
    ...props
}: LTTAvatarProps) => {
    const initials = getInitials(fallbackText);

    return (
        <AvatarPrimitive.Root
            className={cn(
                "relative flex shrink-0 overflow-hidden bg-muted-shadcn",
                shape === "circle" ? "rounded-full" : "rounded-xl",
                className,
            )}
            style={{ width: size, height: size }}
            {...props}
        >
            {src ? (
                <AvatarPrimitive.Image
                    src={src}
                    alt={alt}
                    className={cn("h-full w-full object-cover", imageClassName)}
                />
            ) : null}
            <AvatarPrimitive.Fallback
                className={cn(
                    "flex h-full w-full items-center justify-center bg-muted-shadcn text-muted-foreground-shadcn font-semibold",
                    shape === "circle" ? "rounded-full" : "rounded-xl",
                    fallbackClassName,
                )}
                delayMs={0}
            >
                {initials ? (
                    <span className="text-[0.65rem] leading-none">{initials}</span>
                ) : (
                    <ImageIcon className="h-1/2 w-1/2" />
                )}
            </AvatarPrimitive.Fallback>
        </AvatarPrimitive.Root>
    );
};

LTTAvatar.displayName = "LTTAvatar";

export { LTTAvatar };