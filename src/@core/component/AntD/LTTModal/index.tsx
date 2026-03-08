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
        title={props?.title || "Xác nhận thao tác"}
        closable={{ "aria-label": "Custom Close Button" }}
        open={props?.open}
        onOk={props?.onOk}
        onCancel={props?.onCancel}
      >
        {children}
      </Modal>
    </LTTSpin>
  );
};

export default LTTModal;
