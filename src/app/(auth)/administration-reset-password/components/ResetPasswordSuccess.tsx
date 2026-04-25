"use client";

import React from "react";
import Link from "next/link";

import LTTButton from "@/src/@core/component/AntD/LTTButton";
import { useLocalization } from "@/src/@core/hooks/use-localization";

export default function ResetPasswordSuccess() {
    const { t } = useLocalization();

    return (
        <div className="text-center animate-fade-in pt-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{t("admin.auth.reset_password.success.title", "Success!")}</h1>
                <p className="text-gray-500 text-base">
                    {t("admin.auth.reset_password.success.subtitle", "Your password has been updated successfully.")}
                </p>
            </div>
            <Link href="/administration-login">
                <LTTButton className="w-full py-6 rounded-xl text-base font-semibold">
                    {t("admin.auth.reset_password.success.login_now", "Sign in now")}
                </LTTButton>
            </Link>
        </div>
    );
}
