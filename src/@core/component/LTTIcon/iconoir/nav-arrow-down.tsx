import { ColorKey, COLORS } from "@/src/themes/colors";
import clsx from "clsx";

type Props = React.SVGProps<SVGSVGElement> & {
  variant?: ColorKey;
};

export default function NavArrowDownIcon({
  variant = "secondary",
  ...props
}: Props) {
  return (
    <svg
      width="24px"
      height="24px"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(COLORS[variant], props?.className)}
      {...props}
      >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
