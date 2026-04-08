"use client";
import dynamic from "next/dynamic";
import { Divider } from "antd";
import LTTAppLoader from "@/src/@core/component/LTTAppLoader";

const FormComponent = dynamic(() => import("./index"), { loading: () => <LTTAppLoader />, ssr: false });

export default function AuthPage() {
    return (
        <div className="relative flex lg:flex-row w-full min-h-screen justify-center flex-col sm:p-0 dark:bg-gray-900">
            <FormComponent />
            <div className="hidden lg:flex w-full lg:w-1/2 justify-center items-center bg-gray-50 dark:bg-gray-800">
                <div className="text-center p-8">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Khôi phục mật khẩu</h2>
                    <p className="text-gray-600 dark:text-gray-400">Lấy lại quyền truy cập tài khoản của bạn</p>
                </div>
            </div>
            <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 justify-center h-full items-center -translate-x-1/2">
                <Divider vertical className="h-4/5 mx-0" />
            </div>
        </div>
    );
}
