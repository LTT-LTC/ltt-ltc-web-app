import { Skeleton } from "antd";
import { ReactNode } from "react";

type LTTSkeletonNodeProps = {
  loading?: boolean;
  active?: boolean;
  height?: string | number;
  className?: string;
  children?: ReactNode;
};

const validateHeight = (height: string | number | undefined): number => {
  if (height === undefined) return 160;

  if (height == "table") return 400;

  if (typeof height === "number") {
    return height > 0 ? height : 160;
  }

  const parsed = parseInt(height, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : 160;
};

export const LTTSkeleton = {
  Node: ({ loading = false, active = true, height, className, children }: LTTSkeletonNodeProps) => {
    if (!loading) {
      return children ?? null;
    }

    const validHeight = validateHeight(height);

    return (
      <Skeleton.Node
        active={active}
        className={`w-full! rounded-lg!" ${className}`}
        style={{ height: validHeight, width: "100%", borderRadius: "16px" }}
      />
    );
  },
};