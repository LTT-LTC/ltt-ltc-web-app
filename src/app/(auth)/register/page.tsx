"use client";
import dynamic from "next/dynamic";
import { Divider, Image } from "antd";
import LTTAppLoader from "@/src/@core/component/LTTAppLoader";

const RegisterForm = dynamic(() => import("./index"), { loading: () => <LTTAppLoader />, ssr: false });

export default function SignIn() {
    return (
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
            <RegisterForm />
            <div className="hidden lg:flex justify-center h-full items-center">
                <Divider vertical className="h-11/12 mx-0" />
            </div>
        </div>
    );
}