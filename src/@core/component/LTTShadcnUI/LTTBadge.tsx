import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/@core/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring-shadcn focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-shadcn text-primary-shadcn-foreground hover:bg-primary-shadcn/80",
        secondary:
          "border-transparent bg-secondary-shadcn text-secondary-shadcn-foreground hover:bg-secondary-shadcn/80",
        destructive:
          "border-transparent bg-destructive-shadcn text-destructive-shadcn-foreground hover:bg-destructive-shadcn/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function LTTBadge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { LTTBadge, badgeVariants };
