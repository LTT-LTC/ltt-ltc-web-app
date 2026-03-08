"use client";

import { Checkbox, CheckboxProps } from "antd";

export type LTTCheckboxProps = CheckboxProps & {
    classNames?: string;
};
const LTTCheckbox = ({ ...props }: LTTCheckboxProps) => {
  return <Checkbox {...props}
    className={props?.classNames}
    style={props?.style}
    disabled={ props?.disabled ?? false }
    defaultChecked={props?.defaultChecked ?? false}
  >
  </Checkbox>;
};
export default LTTCheckbox;
