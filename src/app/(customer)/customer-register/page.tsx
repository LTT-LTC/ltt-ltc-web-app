"use client";
import dynamic from "next/dynamic";
import { Divider } from "antd";
import LTTAppLoader from "@/src/@core/component/LTTAppLoader";

import TopBar from "../_components/TopBar";
import Header from "../_components/Header";
import SubNav from "../_components/SubNav";
import Footer from "../_components/Footer";

const FormComponent = dynamic(() => import("./index"), { loading: () => <LTTAppLoader />, ssr: false });

export default function AuthPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <TopBar />
            <Header />
            <main className="flex-1 relative flex lg:flex-row w-full justify-center flex-col sm:p-0 dark:bg-gray-900">
                <FormComponent />
            </main>
            <Footer />
        </div>
    );
}
