import { ColorKey, COLORS } from "@/src/themes/colors";
import clsx from "clsx";

type Props = React.SVGProps<SVGSVGElement> & {
  variant?: ColorKey;
};

export default function TaskListIcon({ variant = "secondary", ...props }: Props) {
  return (
    <svg
      width="24px"
      strokeWidth="1.5"
      height="24px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(COLORS[variant], props?.className)}
      {...props}
    >
      <path
        d="M9 6L20 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3.80002 5.79999L4.60002 6.59998L6.60001 4.59999"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3.80002 11.8L4.60002 12.6L6.60001 10.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3.80002 17.8L4.60002 18.6L6.60001 16.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M9 12L20 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M9 18L20 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
