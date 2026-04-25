import { Modal, ModalProps } from "antd";
import LTTSpin from "../LTTSpin";

type LTTModalProps = ModalProps & {
  loading?: boolean;
};

const LTTModal = ({ children, loading = false, ...props }: LTTModalProps) => {
  return (
    <LTTSpin spinning={loading}>
      <Modal
        {...props}
        title={props.title !== undefined ? props.title : "Confirm Action"}
        closable={{ "aria-label": "Custom Close Button" }}
        open={props?.open}
        onOk={props?.onOk}
        onCancel={props?.onCancel}
        maskTransitionName="ant-fade"
      >
        {children}
      </Modal>
    </LTTSpin>
  );
};

export default LTTModal;

