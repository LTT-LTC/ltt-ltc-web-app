"use client";
import { DatePicker, DatePickerProps } from "antd";

export type LTTDatePickerProps = DatePickerProps & {
  label?: string;
};
const LTTDatePicker = ({ ...props }: LTTDatePickerProps) => {
  return (
    <DatePicker
      {...props}
      placeholder={
        props?.label !== undefined && props?.label !== null
          ? "Chọn " + props?.label.toLowerCase()
          : "Chọn dữ liệu"
      }
      onChange={(date, dateString) => {
        props?.onChange?.(date, dateString);
      }}
      picker={props?.picker ?? "date"}
      className={`w-full !hover:border-primary rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-theme-xs placeholder-gray-400 transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:placeholder-gray-500 dark:focus:border-primary dark:focus:ring-primary ${props.className ?? ""}`}
    />
  );
};

export default LTTDatePicker;