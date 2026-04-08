import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const LTTToaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border-shadcn group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground-shadcn",
          actionButton: "group-[.toast]:bg-primary-shadcn group-[.toast]:text-primary-shadcn-foreground",
          cancelButton: "group-[.toast]:bg-muted-shadcn group-[.toast]:text-muted-foreground-shadcn",
        },
      }}
      {...props}
    />
  );
};

export { LTTToaster, toast };
