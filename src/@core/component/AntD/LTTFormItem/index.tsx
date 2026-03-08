"use client";

import { Form, FormItemProps } from "antd";
import LTTRenderIf from "../../LTTRenderIf";
import React from "react";

export type LTTFormItemProps = FormItemProps & {
  children?: React.ReactNode;
  text?: React.ReactNode;
  isShowText?: boolean;
};

const LTTFormItem = ({
  children,
  text = "",
  isShowText = false,
  ...props
}: LTTFormItemProps) => {
  const isRequired = props.rules?.some((rule) => (rule as any)?.required);

  return (
    <Form.Item
      {...props}
      required={false}
      label={
        <span className="font-semibold">
          {props.label}
          <LTTRenderIf
            condition={isRequired === undefined ? false : isRequired}
          >
            <span className="text-red-500 ml-1">*</span>
          </LTTRenderIf>
        </span>
      }
    >
      {isShowText ? (
        <span className="mb-1 block text-sm text-gray-500 mt-2">{text}</span>
      ) : (
        children
      )}
    </Form.Item>
  );
};

export default LTTFormItem;
