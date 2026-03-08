"use client";
import { InputNumber, InputNumberProps } from "antd";
export type LTTInputNumberProps = InputNumberProps & {
    classNames?: string;
    mode?: "spinner" | "input";
    defaultValue?: number;
    min?: number;
    max?: number;
    size?: 'small' | 'middle' | 'large';
    onChange?: (value: number) => void;
    variant?: "outlined" | "filled";
};
const LTTInputNumber = ({ ...props }: LTTInputNumberProps) => {
    return <InputNumber {...props}
        className={props?.classNames}
        defaultValue={props?.defaultValue ?? 0}
        min={props?.min ?? 1}
        max={props?.max ?? 1000}
        size={props?.size ?? 'middle'}
        onChange={(value) => props?.onChange?.(value ?? 0)}
        style={{ width: "100", ...props?.style }}
        mode={props?.mode ?? "input"}
        variant={props?.variant ?? "outlined"}
    />;
};
export default LTTInputNumber;