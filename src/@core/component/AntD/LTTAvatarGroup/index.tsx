"use client"
import { Avatar } from "antd";
import type { LTTAvatarProps } from "../LTTAvatar";
import LTTAvatar from "../LTTAvatar";
export type LTTAvatarGroupProps = {
    size?: LTTAvatarProps["size"];
    maxCount?: number;
    shape?: LTTAvatarProps["shape"];
    className?: string;
    avatars: LTTAvatarProps[];
};
const LTTAvatarGroup = ({ avatars, size, shape, maxCount, className, ...props }: LTTAvatarGroupProps) => {
    return (
        <Avatar.Group
            {...props}
            size={size ?? "default"}
            maxCount={maxCount ?? 4}
            className={className}
        >
            {avatars.map((avatarProps, index) => (
                <LTTAvatar
                    key={index}
                    {...avatarProps}
                    size={avatarProps.size ?? size ?? "default"}
                    shape={avatarProps.shape ?? shape ?? "circle"}
                />
            ))}
        </Avatar.Group>
    );
}
export default LTTAvatarGroup;