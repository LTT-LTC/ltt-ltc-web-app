import { ColorKey, COLORS } from "@/src/themes/colors";
import clsx from "clsx";

type Props = React.SVGProps<SVGSVGElement> & {
  variant?: ColorKey;
};

export default function SWTEyeClosedIcon({
  variant = "secondary",
  ...props
}: Props) {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(COLORS[variant], props?.className)}
      {...props}
    >
      <path
        d="M19.5 16L17.0248 12.6038"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M12 17.5V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M4.5 16L6.96895 12.6124"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M3 8C6.6 16 17.4 16 21 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
