import { Avatar } from 'antd';
import type { AvatarProps } from 'antd/es/avatar';
import { DEFAULT_AVATAR_IMAGE } from "@/src/@core/const/index"
export type LTTAvatarProps = AvatarProps & {
    shape?: 'circle' | 'square';
    src?: string;
    alt?: string;
    className?: string;
};
const LTTAvatar = ({ ...props }: LTTAvatarProps) => {
    return (
        <Avatar
            {...props}
            className={`rounded-full shadow-md hover:shadow-md border-2 transition-all duration-200 bg-white${props?.className || ''}`}
            size={props?.size ?? 48}
            shape={props?.shape ?? 'square'}
            src={props?.src || DEFAULT_AVATAR_IMAGE}
            alt={props?.alt}
        />
    );
}
export default LTTAvatar;