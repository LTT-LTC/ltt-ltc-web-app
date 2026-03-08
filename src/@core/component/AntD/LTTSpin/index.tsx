import { Spin, type SpinProps } from "antd";

const LTTSpin = ({ children, ...props }: SpinProps) => {
  return <Spin {...props}>{children}</Spin>;
};

export default LTTSpin;
