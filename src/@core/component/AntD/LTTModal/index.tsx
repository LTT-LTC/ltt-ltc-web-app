import { Modal, ModalProps } from "antd";
import LTTSpin from "../LTTSpin";

type LTTModalProps = ModalProps & {
  loading?: boolean;
};

const LTTModal = ({ children, loading = false, ...props }: LTTModalProps) => {
  const okButtonProps = {
    ...props.okButtonProps,
    className: `${props.okButtonProps?.className ?? ""} mx-3`.trim(),
  };

  const cancelButtonProps = {
    ...props.cancelButtonProps,
    className: `${props.cancelButtonProps?.className ?? ""}`.trim(),
  };

  return (
    <LTTSpin spinning={loading}>
      <Modal
        {...props}
        title={props.title !== undefined ? props.title : "Confirm Action"}
        closable={{ "aria-label": "Custom Close Button" }}
        open={props?.open}
        onOk={props?.onOk}
        onCancel={props?.onCancel}
        okButtonProps={okButtonProps}
        cancelButtonProps={cancelButtonProps}
        maskTransitionName="ant-fade"
      >
        {children}
      </Modal>
    </LTTSpin>
  );
};

export default LTTModal;

