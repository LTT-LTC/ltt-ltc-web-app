"use client";

import React from "react";
import Link from "next/link";

import LTTButton from "@/src/@core/component/AntD/LTTButton";

export default function ResetPasswordSuccess() {
    return (
        <div className="text-center animate-fade-in pt-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Thành công!</h1>
                <p className="text-gray-500 text-base">
                    Mật khẩu của bạn đã được cập nhật thành công.
                </p>
            </div>
            <Link href="/signin">
                <LTTButton className="w-full py-6 rounded-xl text-base font-semibold">
                    Đăng nhập ngay
                </LTTButton>
            </Link>
        </div>
    );
}
