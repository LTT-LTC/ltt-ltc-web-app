"use client";

import React from "react";
import Link from "next/link";
import { FormInstance } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import NavArrowLeftIcon from "@/src/@core/component/LTTIcon/iconoir/nav-arrow-left";

import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTForm from "@/src/@core/component/AntD/LTTForm";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import { setTenantOnClient } from "@/src/@core/utils/tenant";
import { useLocalization } from "@/src/@core/hooks/use-localization";

const tenants = JSON.parse(process.env.NEXT_PUBLIC_TENANTS || "[]");

interface RequestLinkStepProps {
    form: FormInstance;
    onFinish: () => Promise<void>;
    loading?: boolean;
}

export default function ResetPasswordLink({ form, onFinish, loading }: RequestLinkStepProps) {
    const { t } = useLocalization();

    const onChangeTenant = (value: string) => {
        if (value) {
            setTenantOnClient(value);
        } else {
            setTenantOnClient("LTC");
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <Link
                    href="/administration-login"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <NavArrowLeftIcon />
                    {t("admin.auth.reset_password.request_link.back_to_login", "Back to sign in")}
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                    {t("admin.auth.reset_password.request_link.title", "Enter email")}
                </h1>
                <p className="text-gray-500 text-base leading-relaxed">
                    {t("admin.auth.reset_password.request_link.subtitle", "Enter your email. We will send a password reset link to your inbox.")}
                </p>
            </div>

            <LTTForm form={form} onFinish={onFinish}>
                <LTTFormItem
                    name="tenantId"
                    label={t("admin.auth.reset_password.request_link.tenant_label", "Tenant")}
                    className="mb-4"
                    rules={[
                        { required: true, message: t("admin.auth.reset_password.request_link.tenant_required", "Please select a tenant") },
                    ]}
                >
                    <LTTSelect
                        label={t("admin.auth.reset_password.request_link.tenant_label", "Tenant")}
                        placeholder={t("admin.auth.reset_password.request_link.tenant_placeholder", "Select tenant")}
                        onChange={onChangeTenant}
                        className="w-full h-10"
                        options={tenants}
                    />
                </LTTFormItem>

                <LTTFormItem
                    name="studentId"
                    className="mb-8"
                    rules={[
                        { required: true, message: t("admin.auth.reset_password.request_link.email_required", "Please enter email") },
                        {
                            len: 8,
                            message: t("admin.auth.reset_password.request_link.email_invalid", "Invalid email or email does not exist in the system"),
                        },
                    ]}
                >
                    <LTTInput
                        placeholder={t("admin.auth.reset_password.request_link.email_placeholder", "Enter email")}
                        prefix={<MessageOutlined className="text-brand-500 text-lg mr-2" />}
                        size="large"
                        maxLength={8}
                        className="py-3 rounded-xl"
                    />
                </LTTFormItem>

                <LTTButton
                    htmlType="submit"
                    loading={loading}
                    className="w-full bg-gray-200 text-gray-500 hover:bg-brand-500 hover:text-white
                           border-none font-semibold text-base py-6 rounded-xl transition-all"
                >
                    {t("admin.auth.reset_password.request_link.submit", "Verify account")}
                </LTTButton>
            </LTTForm>
        </div>
    );
}
