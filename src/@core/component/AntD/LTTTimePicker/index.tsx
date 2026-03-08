"use client";
import { TimePicker } from "antd";
import type { TimePickerProps } from "antd";
import type { RangePickerTimeProps } from "antd/es/time-picker";
import dayjs, { Dayjs } from "dayjs";
const format = "HH:mm";
type SingleProps = {
    mode?: "single";
    defaultTime?: string;
    onChange?: () => void;
} & TimePickerProps;

type RangeProps = {
    mode: "range";
    defaultRange?: [string, string];
    onChange?: () => void;
} & RangePickerTimeProps<Dayjs>;

export type LTTTimePickerProps = SingleProps | RangeProps;

const LTTTimePicker = ({ onChange, ...props }: LTTTimePickerProps) => {
    if (props.mode === "range") {
        const rangeValue: [Dayjs, Dayjs] | undefined = props.defaultRange
            ? [
                dayjs(props.defaultRange[0], format),
                dayjs(props.defaultRange[1], format),
            ]
            : undefined;

        return (
            <TimePicker.RangePicker
                {...props}
                format={format}
                onChange={onChange}
                defaultValue={rangeValue}
                className={`${props.className ?? ""}`}
            />
        );
    }

    const singleValue: Dayjs | undefined = props.defaultTime
        ? dayjs(props.defaultTime, format)
        : undefined;

    return (
        <TimePicker
            {...props}
            format={format}
            defaultValue={singleValue}
            onChange={onChange}
            className={`${props.className ?? ""}`}
        />
    );
};

export default LTTTimePicker;
