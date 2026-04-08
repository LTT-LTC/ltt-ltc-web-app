import { cn } from "@/src/@core/utils/cn";

function LTTSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted-shadcn", className)} {...props} />;
}

export { LTTSkeleton };
