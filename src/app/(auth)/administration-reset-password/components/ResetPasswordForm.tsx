"use client";

import React from "react";
import { FormInstance, Input } from "antd";
import { InfoCircleOutlined, MessageOutlined } from "@ant-design/icons";

import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTForm from "@/src/@core/component/AntD/LTTForm";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTTooltip from "@/src/@core/component/AntD/LTTToolTip";
import { useLocalization } from "@/src/@core/hooks/use-localization";

interface ResetFormStepProps {
    form: FormInstance;
    onFinish: () => Promise<void>;
    loading?: boolean;
}

export default function ResetPasswordForm({ form, onFinish, loading }: ResetFormStepProps) {
    const { t } = useLocalization();

    const passwordRequirements = (
        <div className="text-xs">
            <div className="mb-1 font-semibold">{t("admin.auth.reset_password.requirements.intro", "The new password must contain from 8 to 32 characters.")}</div>
            <ul className="list-disc pl-4 m-0 space-y-0.5">
                <li>{t("admin.auth.reset_password.requirements.uppercase", "1 uppercase letter (A-Z).")}</li>
                <li>{t("admin.auth.reset_password.requirements.number", "1 number (0-9).")}</li>
                <li>{t("admin.auth.reset_password.requirements.special", "1 special character (for example: !, @, #, $, %, etc.).")}</li>
            </ul>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="mb-8 font-sans">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                    {t("admin.auth.reset_password.form_title", "Reset password")}
                </h1>
                <p className="text-gray-500 text-base leading-relaxed">
                    {t("admin.auth.reset_password.form_subtitle", "Enter and confirm your new password so your account can be used again.")}
                </p>
            </div>

            <LTTForm form={form} onFinish={onFinish} layout="vertical">
                <LTTFormItem
                    name="newPassword"
                    className="mb-4"
                    rules={[
                        { required: true, message: t("admin.auth.reset_password.validation.new_password_required", "Please enter a new password") },
                        { min: 8, message: t("admin.auth.reset_password.validation.new_password_too_short", "Password is too short") },
                        { max: 32, message: t("admin.auth.reset_password.validation.new_password_too_long", "Password is too long") },
                        {
                            pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/,
                            message: t("admin.auth.reset_password.validation.new_password_invalid", "Password must include at least 1 uppercase letter, 1 number, and 1 special character"),
                        },
                    ]}
                >
                    <Input.Password
                        placeholder={t("admin.auth.reset_password.new_password_placeholder", "Enter new password")}
                        size="large"
                        className="py-3 rounded-xl"
                        maxLength={32}
                        allowClear
                        prefix={<MessageOutlined className="text-brand-500 text-lg mr-2" />}
                        suffix={
                            <LTTTooltip
                                title={passwordRequirements}
                                placement="bottom"
                                color="#4F46E5"
                                styles={{ container: { width: 280, padding: 12, borderRadius: 16 } }}
                            >
                                <InfoCircleOutlined className="text-brand-500 text-lg cursor-help ml-1" />
                            </LTTTooltip>
                        }
                    />
                </LTTFormItem>

                <LTTFormItem
                    name="confirmPassword"
                    dependencies={["newPassword"]}
                    className="mb-8"
                    rules={[
                        { required: true, message: t("admin.auth.reset_password.validation.confirm_password_required", "Please confirm your password") },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error(t("admin.auth.reset_password.validation.confirm_password_mismatch", "Passwords do not match")));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder={t("admin.auth.reset_password.confirm_password_placeholder", "Confirm new password")}
                        size="large"
                        className="py-3 rounded-xl"
                        maxLength={32}
                        allowClear
                        prefix={<MessageOutlined className="text-brand-500 text-lg mr-2" />}
                    />
                </LTTFormItem>

                <LTTButton
                    htmlType="submit"
                    loading={loading}
                    className="w-full bg-gray-200 text-gray-500 hover:bg-brand-500 hover:text-white
                          border-none font-semibold text-base py-6 rounded-xl transition-all"
                >
                    {t("admin.auth.reset_password.submit", "Reset password")}
                </LTTButton>
            </LTTForm>
        </div>
    );
}
