import { Card, CardProps } from "antd";
import { LTTSkeleton } from "../LTTSkeleton";

type LTTCardProps = CardProps & {
  children: React.ReactNode;
  loading?: boolean;
  height?: string | number | "table";
};

const LTTCard = ({ children, loading, height, ...props }: LTTCardProps) => {
  if (loading && loading === true) {
    return (
      <LTTSkeleton.Node loading={loading} className={`w-full mt-3`} height={height} />
    );
  }

  return (
    <Card {...props} variant="borderless">
      {children}
    </Card>
  );
};

export default LTTCard;
