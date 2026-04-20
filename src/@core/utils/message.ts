import { App } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import type { ArgsProps, NotificationInstance } from "antd/es/notification/interface";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { translate } from "./localization";

let message: MessageInstance;
let notification: NotificationInstance;

export const setMessageInstance = (msg: MessageInstance, notif: NotificationInstance) => {
  message = msg;
  notification = notif;
};

export const useMessageInit = () => {
  const { message: msg, notification: notif } = App.useApp();
  setMessageInstance(msg, notif);
};

const showMessageError = (content: string = translate("toast.error_default", "Có lỗi xảy ra")) => {
  return toast.error(content);
};

const showMessageSuccess = (content: string = translate("toast.success_default", "Xử lý thành công")) => {
  return toast.success(content);
};

const showNotificationError = (description?: string | ReactNode, options?: ArgsProps) => {
  const messageText =
    typeof description === "string"
      ? description
      : translate("toast.error_default", "Lỗi xảy ra trong quá trình xử lý, vui lòng liên hệ admin.");
  return toast.error(messageText, {
    id: options?.key ? String(options.key) : undefined,
  });
};

const showNotificationSuccess = (description?: string | ReactNode, options?: ArgsProps) => {
  const messageText =
    typeof description === "string"
      ? description
      : translate("toast.success_default", "Xử lý thành công.");
  return toast.success(messageText, {
    id: options?.key ? String(options.key) : undefined,
  });
};

export {
  showMessageError,
  showMessageSuccess,
  showNotificationError,
  showNotificationSuccess,
}