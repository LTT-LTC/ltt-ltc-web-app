"use client";
import NavArrowLeftIcon from "@/src/@core/component/LTTIcon/iconoir/nav-arrow-left";
import Link from "next/link";
import FormDetail from "./components/RegisterForm";
import useLTTTitle from "@/src/@core/hooks/useLTTTitle";

export default function AuthIndex() {
    useLTTTitle("Đăng ký");

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center py-5 sm:py-10 bg-white dark:bg-transparent">
            <div className="w-full max-w-md mx-auto mb-5 px-4 sm:px-0">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <NavArrowLeftIcon />
                    Trở lại trang chủ
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
                <div className="mb-10">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="mb-2 font-bold text-gray-800 text-3xl dark:text-white/90">
                            Tạo tài khoản mới
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Tạo tài khoản dành cho nhân viên quản trị.
                        </p>
                    </div>
                    <FormDetail />
                </div>
            </div>
        </div>
    );
}
