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
import { TENANT_KEY } from "@/src/@core/const";

const tenants = JSON.parse(process.env.NEXT_PUBLIC_TENANTS || "[]");

interface RequestLinkStepProps {
    form: FormInstance;
    onFinish: () => Promise<void>;
    loading?: boolean;
}

export default function ResetPasswordLink({ form, onFinish, loading }: RequestLinkStepProps) {
    const onChangeTenant = (value: string) => {
        if (value) {
            localStorage.setItem(TENANT_KEY, value);
        } else {
            localStorage.removeItem(TENANT_KEY);
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
                    Quay lại đăng nhập
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                    Nhập email
                </h1>
                <p className="text-gray-500 text-base leading-relaxed">
                    Nhập email của bạn. Chúng tôi sẽ gửi một link khôi phục mật khẩu tới email của bạn.
                </p>
            </div>

            <LTTForm form={form} onFinish={onFinish}>
                <LTTFormItem
                    name="tenantId"
                    label="Tenant"
                    className="mb-4"
                    rules={[
                        { required: true, message: "Vui lòng chọn Tenant" },
                    ]}
                >
                    <LTTSelect
                        label="Tenant"
                        placeholder="Chọn Tenant"
                        onChange={onChangeTenant}
                        className="w-full h-10"
                        options={tenants}
                    />
                </LTTFormItem>

                <LTTFormItem
                    name="studentId"
                    className="mb-8"
                    rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        {
                            len: 8,
                            message: "Sai email hoặc email không tồn tại trong hệ thống",
                        },
                    ]}
                >
                    <LTTInput
                        placeholder="Nhập email"
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
                    Xác minh tài khoản
                </LTTButton>
            </LTTForm>
        </div>
    );
}
