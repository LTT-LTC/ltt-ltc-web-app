"use client";

import React from "react";
import { App } from "antd";
import { CheckCircleFilled, CloseCircleFilled, InfoCircleFilled, ExclamationCircleFilled } from "@ant-design/icons";
import type { ArgsProps, NotificationInstance } from "antd/es/notification/interface";

let notification: NotificationInstance;

export const useLTTNotificationInit = () => {
    const { notification: notif } = App.useApp();
    notification = notif;
};

type LTTNotificationType = "success" | "error" | "info" | "warning";

interface LTTNotificationOptions extends Omit<ArgsProps, "message" | "description" | "icon" | "className" | "style"> {
    placement?: ArgsProps["placement"];
    duration?: number;
}

const iconMap: Record<LTTNotificationType, React.ReactNode> = {
    success: <CheckCircleFilled className="!text-white text-[22px]" />,
    error: <CloseCircleFilled className="!text-white text-[22px]" />,
    info: <InfoCircleFilled className="!text-white text-[22px]" />,
    warning: <ExclamationCircleFilled className="!text-white text-[22px]" />,
};

const bgMap: Record<LTTNotificationType, string> = {
    success: "LTT-notification-success",
    error: "LTT-notification-error",
    info: "LTT-notification-info",
    warning: "LTT-notification-warning",
};

const showLTTNotification = (
    type: LTTNotificationType,
    title: string,
    description?: string | React.ReactNode,
    options?: LTTNotificationOptions
) => {
    return notification?.open({
        ...options,
        message: <span className="!text-white font-semibold text-[15px]">{title}</span>,
        description: <span className="!text-white/90 text-[13px]">{description}</span>,
        icon: iconMap[type],
        placement: options?.placement ?? "topRight",
        duration: options?.duration ?? 4,
        className: `LTT-notification ${bgMap[type]}`,
        closeIcon: <span className="!text-white/80 hover:!text-white text-base">✕</span>,
    });
};

export const LTTNotificationSuccess = (
    title: string,
    description?: string | React.ReactNode,
    options?: LTTNotificationOptions
) => showLTTNotification("success", title, description, options);

export const LTTNotificationError = (
    title: string,
    description?: string | React.ReactNode,
    options?: LTTNotificationOptions
) => showLTTNotification("error", title, description, options);

export const LTTNotificationInfo = (
    title: string,
    description?: string | React.ReactNode,
    options?: LTTNotificationOptions
) => showLTTNotification("info", title, description, options);

export const LTTNotificationWarning = (
    title: string,
    description?: string | React.ReactNode,
    options?: LTTNotificationOptions
) => showLTTNotification("warning", title, description, options);

export default showLTTNotification;
