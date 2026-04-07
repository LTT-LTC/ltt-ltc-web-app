"use client";
import NavArrowLeftIcon from "@/src/@core/component/LTTIcon/iconoir/nav-arrow-left";
import Link from "next/link";
import FormDetail from "./components/SignInForm";
import useLTTTitle from "@/src/@core/hooks/useLTTTitle";

export default function SignInForm() {

    useLTTTitle("Đăng nhập");
    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center px-4 sm:px-0">
            <div className="w-full max-w-md pt-5 sm:pt-10 mx-auto mb-5">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <NavArrowLeftIcon />
                    Trở lại trang chủ
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Đăng nhập
                        </h1>
                    </div>
                    <FormDetail />
                </div>
            </div>
        </div>
    );
}