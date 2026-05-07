"use client";
import React from "react";
import { LTTAvatar } from "@/src/@core/component/LTTShadcnUI/LTTAvatar";

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
        <div className="group flex flex-col items-center gap-2 text-center w-20">
            <LTTAvatar
                src={image}
                size={size}
                shape="circle"
                alt={name}
                fallbackText={name}
            />
            <div className="w-full">
                <p className="cast-marquee text-sm font-semibold text-slate-900 dark:text-white m-0" title={name}>
                    <span className="cast-marquee__inner">{name}</span>
                </p>
                <p className="text-xs text-slate-400 truncate m-0" title={role}>
                    {role}
                </p>
            </div>
        </div>
    );
};

export default LTTCastCard;
