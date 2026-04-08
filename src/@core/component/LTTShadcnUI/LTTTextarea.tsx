import * as React from "react";

import { cn } from "@/src/@core/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const LTTTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input-shadcn bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground-shadcn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-shadcn focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
LTTTextarea.displayName = "LTTTextarea";

export { LTTTextarea };
