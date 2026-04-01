import { Modal, ModalProps } from "antd";
import LTTSpin from "../../LTTSpin";

type LTTConfirmationModalProps = ModalProps & {
  loading?: boolean;
};

const LTTConfirmationModal = ({
  children,
  loading = false,
  ...props
}: LTTConfirmationModalProps) => {
  return (
    <LTTSpin spinning={loading}>
      <Modal
        {...props}
        title={props?.title || "Confirm Action"}
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

export default LTTConfirmationModal;

