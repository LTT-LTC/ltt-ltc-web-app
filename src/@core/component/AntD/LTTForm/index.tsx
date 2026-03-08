import { Form, FormProps } from "antd";
import LTTSpin from "../LTTSpin";

export type LTTFormProps = FormProps & {
  children: React.ReactNode;
  loading?: boolean;
};

const LTTForm = ({ children, loading = false, ...props }: LTTFormProps) => {
  return (
    <LTTSpin spinning={loading}>
      <Form {...props} layout={props?.layout ?? "vertical"}>
        {children}
      </Form>
    </LTTSpin>
  );
};

export default LTTForm;
