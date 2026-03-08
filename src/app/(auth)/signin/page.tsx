"use client";
import dynamic from "next/dynamic";
import { Divider, Image } from "antd";
import LTTAppLoader from "@/src/@core/component/LTTAppLoader";

const SignInForm = dynamic(() => import("./index"), { loading: () => <LTTAppLoader />, ssr: false });

export default function SignIn() {
    return (
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
            <SignInForm />
            <div className="hidden lg:flex justify-center h-full items-center">
                <Divider vertical className="h-11/12 mx-0" />
            </div>
            <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid bg-white items-center hidden">
                <div className="relative items-center justify-center flex z-1">
                    {/* <GridShape /> */}
                    <div className="flex flex-col items-center max-w-xs animate-float">
                        <Image
                            width={800}
                            height={600}
                            src="/images/main/hrm-logo.jpg"
                            alt="Logo"
                            preview={false}
                        />
                        <p className="text-center text-gray-400 dark:text-white/60">
                            Hệ thống HRM toàn diện giúp quản lý nhân sự hiệu quả và tối ưu hóa
                            quy trình làm việc.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
