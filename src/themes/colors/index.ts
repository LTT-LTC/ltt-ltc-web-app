export const COLORS = {
    primary: "text-[var(--color-primary)]",
    secondary: "text-[var(--color-secondary)]",
    danger: "text-[var(--color-error)]",
    warning: "text-[var(--color-warning)]",
    success: "text-[var(--color-success)]",
    info: "text-[var(--color-info)]",
} as const;

export type ColorKey = keyof typeof COLORS;