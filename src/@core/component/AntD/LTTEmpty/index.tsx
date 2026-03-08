import { Empty, EmptyProps } from "antd";

type LTTEmptyProps = EmptyProps & {};

const LTTEmpty = ({ ...props }: LTTEmptyProps) => {
  return (
    <Empty
      {...props}
      description={props.description ?? "Không có dữ liệu"}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );
};

export default LTTEmpty;
