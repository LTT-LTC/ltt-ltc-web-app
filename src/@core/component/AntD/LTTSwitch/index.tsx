"use client";

import { Switch, SwitchProps } from "antd";

export type LTTSwitchProps = SwitchProps & {
    classNames?: string;
};

const LTTSwitch = ({ classNames, ...props }: LTTSwitchProps) => {
    return <Switch {...props} className={classNames} />;
};

export default LTTSwitch;
