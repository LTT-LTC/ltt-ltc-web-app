"use client";
import { Checkbox } from "antd";
import type { CheckboxGroupProps } from "antd/es/checkbox";

export type LTTCheckboxGroupProps = Omit<CheckboxGroupProps, "options"> & {
  title?: string;
  className?: string;
  options: { label: string; value: string }[];
  columns?: number;
};

const LTTCheckboxGroup = ({
  title,
  className = "",
  options,
  columns = 1,
  style,
  ...props
}: LTTCheckboxGroupProps) => {
  return (
    <div className={`${className}`}>
      {title && <h3 className="mb-2 text-sm font-medium">{title}</h3>}
      <Checkbox.Group
        {...props}
        options={options}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: "10px",
          ...style,
        }}
      />
    </div>
  );
};

export default LTTCheckboxGroup;
