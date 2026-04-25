"use client";
import NavArrowLeftIcon from "@/src/@core/component/LTTIcon/iconoir/nav-arrow-left";
import Link from "next/link";
import FormDetail from "./components/SignInForm";
import useLTTTitle from "@/src/@core/hooks/useLTTTitle";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export default function AuthIndex() {
    const { t } = useLocalization();
    useLTTTitle(t("admin.auth.login.page_title", "Login"));

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center py-5 sm:py-10 bg-white dark:bg-transparent">
            <div className="w-full max-w-md mx-auto mb-5 px-4 sm:px-0">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <NavArrowLeftIcon />
                    {t("admin.auth.login.back_to_home", "Back to homepage")}
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 sm:px-0">
                <div className="mb-10">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="mb-2 font-bold text-gray-800 text-3xl dark:text-white/90">
                            {t("admin.auth.login.welcome_title", "Welcome Administrator")}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {t("admin.auth.login.welcome_subtitle", "Please sign in to continue management tasks.")}
                        </p>
                    </div>
                    <FormDetail />
                </div>
            </div>
        </div>
    );
}
