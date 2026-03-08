"use client";
import { FloatButton, FloatButtonProps } from 'antd';
export type LTTFloatButtonProps = FloatButtonProps & {
    className?: string;
    icon?: React.ReactNode;
};
export const LTTFloatButton = ({
    shape = "circle",
    icon,
    className,
    ...props
}: LTTFloatButtonProps) => {
    return <FloatButton className={className} icon={icon} shape={shape} {...props} />;
};

