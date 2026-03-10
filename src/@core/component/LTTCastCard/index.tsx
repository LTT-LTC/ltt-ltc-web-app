"use client";
import React from "react";
import LTTAvatar from "@/src/@core/component/AntD/LTTAvatar";

export interface LTTCastCardProps {
    name: string;
    role: string;
    image?: string;
    size?: number;
}

const LTTCastCard: React.FC<LTTCastCardProps> = ({
    name,
    role,
    image,
    size = 72,
}) => {
    return (
        <div className="flex flex-col items-center gap-2 text-center w-20">
            <LTTAvatar
                src={image}
                size={size}
                shape="circle"
            />
            <div className="w-full">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate m-0">
                    {name}
                </p>
                <p className="text-xs text-slate-400 truncate m-0">
                    {role}
                </p>
            </div>
        </div>
    );
};

export default LTTCastCard;
