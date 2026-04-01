import { Empty, EmptyProps } from "antd";

type LTTEmptyProps = EmptyProps & {};

const LTTEmpty = ({ ...props }: LTTEmptyProps) => {
  return (
    <Empty
      {...props}
      description={props.description ?? "No data"}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );
};

export default LTTEmpty;

