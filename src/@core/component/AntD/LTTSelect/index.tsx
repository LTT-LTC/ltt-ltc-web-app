"use client";
import { Select, SelectProps, Tag } from "antd";
import clsx from "clsx";
import LTTSpin from "../LTTSpin";

type OptionType = {
  label: string;
  value: string | number;
  disabled?: boolean;
};

type TagRender = SelectProps["tagRender"];
const tagRender: TagRender = (props) => {
  const { label, closable, onClose } = props;
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      className=""
    >
      {label}
    </Tag>
  );
};

export type LTTSelectProps = SelectProps & {
  label?: string;
  onChange?: SelectProps["onChange"];
  options?: OptionType[];
  showSearch?: boolean;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  loading?: boolean;
};
const LTTSelect = ({ loading = false, ...props }: LTTSelectProps) => {
  return (
    <LTTSpin spinning={loading}>
      <Select
        {...props}
        className={clsx("rounded-lg! p-2!", props?.className)}
        placeholder={
          props.placeholder
            ? props.placeholder
            : props.label
              ? `Chọn ${props.label.toLowerCase()}`
              : "Chọn dữ liệu"
        }
        showSearch={props?.showSearch ?? false}
        allowClear={props?.allowClear ?? true}
        variant={props?.variant ?? "outlined"}
        disabled={props?.disabled ?? false}
        size={props?.size ?? "middle"}
        maxTagCount="responsive"
        tagRender={tagRender}
      />
    </LTTSpin>
  );
};
export default LTTSelect;
