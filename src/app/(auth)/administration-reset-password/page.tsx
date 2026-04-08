"use client";
import dynamic from "next/dynamic";
import { Divider } from "antd";
import LTTAppLoader from "@/src/@core/component/LTTAppLoader";

const FormComponent = dynamic(() => import("./index"), { loading: () => <LTTAppLoader />, ssr: false });

export default function AuthPage() {
    return (
        <div className="relative flex lg:flex-row w-full min-h-screen justify-center flex-col sm:p-0 dark:bg-gray-900">
            <FormComponent />
        </div>
    );
}
