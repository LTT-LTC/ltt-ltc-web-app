"use client"
import { Tooltip, TooltipProps } from "antd";
export type LTTTooltipProps = TooltipProps & {
    classNames?: string;
    placement?: string;
    color?: string;
    style?: React.CSSProperties;
};

const LTTTooltip = ({ ...props }: LTTTooltipProps) => {
    return <Tooltip {...props}
        className={props?.classNames}
        placement={props.placement}
        color={props.color}
        style={props?.style}
    />;
};

export default LTTTooltip;