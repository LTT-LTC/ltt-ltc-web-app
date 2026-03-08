import { Button, ButtonProps } from "antd";

type LTTButtonProps = Omit<ButtonProps, "size" | "type" | "variant"> & {
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
};

const LTTButton = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  ...props
}: LTTButtonProps) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
    lg: "px-6 py-4 text-base",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "!bg-brand-500 text-white shadow-theme-xs !hover:bg-brand-600 !hover:text-white disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };
  // ${variantClasses[variant]}

  return (
    <Button
      className={`
        px-4 py-5
        text-gray-500
        inline-flex items-center justify-center font-medium gap-2 rounded-lg transition ${className} ${sizeClasses[size]} ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </Button>
  );
};

export default LTTButton;
