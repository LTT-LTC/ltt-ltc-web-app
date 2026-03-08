"use client";
import { DatePicker, DatePickerProps, Space } from "antd";

const { RangePicker } = DatePicker;

export type LTTDatePickerRangeProps = DatePickerProps & {
  label?: string;
};
const LTTDatePickerRange = ({ ...props }: LTTDatePickerRangeProps) => {
  return (
    <Space vertical size={12}>
      <RangePicker
        picker={props?.picker ?? "date"}
        style={props?.style}
        id={{
          start: "startInput",
          end: "endInput",
        }}
        onFocus={(_, info) => {
          console.log("Focus:", info.range);
        }}
        onBlur={(_, info) => {
          console.log("Blur:", info.range);
        }}
        className={`w-full !hover:border-primary rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-theme-xs placeholder-gray-400 transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:placeholder-gray-500 dark:focus:border-primary dark:focus:ring-primary ${props.className ?? ""}`}
      />
    </Space>
  );
};

export default LTTDatePickerRange;
