"use client";

import React from "react";
import { Input, GetProps } from "antd";
import PasswordCursor from "@/src/@core/component/LTTIcon/iconoir/password-cursor";
import SearchIcon from "@/src/@core/component/LTTIcon/iconoir/search";
type InputProps = GetProps<typeof Input>;
type PasswordProps = GetProps<typeof Input.Password>;
type TextAreaProps = GetProps<typeof Input.TextArea>;
type SearchProps = GetProps<typeof Input.Search>;
type OTPProps = GetProps<typeof Input.OTP>;

const { Search, TextArea, OTP, Password } = Input;

export type LTTInputProps = InputProps & {
  label?: string;
  className?: string;
};

export type LTTInputPasswordProps = PasswordProps & {
  className?: string;
};

export type LTTInputTextAreaProps = TextAreaProps & {
  className?: string;
};

export type LTTInputSearchProps = SearchProps & {
  className?: string;
};

export type LTTInputOTPProps = OTPProps & {
  className?: string;
};

const LTTInput = ({ ...props }: LTTInputProps) => {
  return (
    <Input
      {...props}
      placeholder={
        props?.label !== undefined && props?.label !== null
          ? "Nhập " + props?.label.toLowerCase()
          : "Nhập dữ liệu"
      }
      onChange={(e: any) => {
        props?.onChange?.(e.target.value);
      }}
      showCount={props?.showCount ?? true}
      maxLength={props?.maxLength ?? 250}
      allowClear={props?.allowClear ?? true}
      className={`w-full !hover:border-primary rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-theme-xs placeholder-gray-400 transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:placeholder-gray-500 dark:focus:border-primary dark:focus:ring-primary ${props.className ?? ""}`}
    />
  );
};

const LTTInputPassword = ({ ...props }: LTTInputPasswordProps) => {
  return (
    <Password
      {...props}
      onChange={(e: any) => {
        props?.onChange?.(e.target.value);
      }}
      prefix={<PasswordCursor />}
      maxLength={props.maxLength ?? 32}
      allowClear={props.allowClear ?? true}
      placeholder={props.placeholder ?? "Nhập mật khẩu"}
      className={`w-full !hover:border-primary rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-theme-xs placeholder-gray-400 transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:placeholder-gray-500 dark:focus:border-primary dark:focus:ring-primary ${props.className ?? ""}`}
    />
  );
};

const LTTInputTextArea = ({ ...props }: LTTInputTextAreaProps) => {
  return (
    <TextArea
      {...props}
      onChange={(e: any) => {
        props?.onChange?.(e.target.value);
      }}
      maxLength={props.maxLength ?? 500}
      showCount={props.showCount ?? true}
      className={`w-full !hover:border-primary rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-theme-xs placeholder-gray-400 transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:placeholder-gray-500 dark:focus:border-primary dark:focus:ring-primary ${props.className ?? ""}`}
    />
  );
};

const LTTInputSearch = ({ className, ...props }: LTTInputSearchProps) => {
  return (
    <Input
      prefix={<SearchIcon size={20} className="text-gray-400" />}
      variant="borderless"
      placeholder={props.placeholder ?? "Tìm kiếm"}
      {...props}
      className={`
        !border !border-gray-200 
        hover:!border-blue-400 
        focus-within:!border-blue-500 
        !rounded-xl !bg-white 
        transition-all duration-200
        px-2
        ${className ?? ""}
      `.trim()}
      onChange={(e: any) => {
        props?.onChange?.(e.target.value);
      }}
    />
  );
};

const LTTInputOTP = ({ ...props }: LTTInputOTPProps) => {
  return (
    <OTP
      {...props}
      onChange={(e: any) => {
        props?.onChange?.(e.target.value);
      }}
      length={props.length ?? 6}
      className={`w-full !hover:border-primary rounded-lg border-gray-300 bg-white px-3 py-2 text-sm shadow-theme-xs placeholder-gray-400 transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:placeholder-gray-500 dark:focus:border-primary dark:focus:ring-primary ${props.className ?? ""}`}
    />
  );
};
export {
  LTTInput,
  LTTInputPassword,
  LTTInputTextArea,
  LTTInputSearch,
  LTTInputOTP,
};

export default LTTInput;
