"use client";
import NavArrowLeftIcon from "@/src/@core/component/LTTIcon/iconoir/nav-arrow-left";
import Link from "next/link";
import SignInForm from "./components/SignInForm";
import SignUpForm from "./components/SignUpForm";
import useLTTTitle from "@/src/@core/hooks/useLTTTitle";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import { useState } from "react";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState("login");

    useLTTTitle(activeTab === "login" ? "Đăng nhập" : "Đăng ký");

    const tabItems = [
        {
            key: "login",
            label: "Đăng nhập",
            children: <SignInForm />,
        },
        {
            key: "register",
            label: "Đăng ký",
            children: <SignUpForm />,
        },
    ];

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center py-5 sm:py-10">
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
                            {activeTab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {activeTab === "login" 
                                ? "Vui lòng đăng nhập để tiếp tục." 
                                : "Tham gia với chúng tôi để nhận nhiều ưu đãi hấp dẫn."}
                        </p>
                    </div>
                    
                    <LTTTabs 
                        activeKey={activeTab} 
                        onChange={setActiveTab} 
                        items={tabItems}
                        className="customer-auth-tabs"
                    />
                </div>
            </div>
        </div>
    );
}