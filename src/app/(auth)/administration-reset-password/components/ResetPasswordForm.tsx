"use client";

import React from "react";
import { FormInstance, Input } from "antd";
import { InfoCircleOutlined, MessageOutlined } from "@ant-design/icons";

import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTForm from "@/src/@core/component/AntD/LTTForm";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTTooltip from "@/src/@core/component/AntD/LTTToolTip";

interface ResetFormStepProps {
    form: FormInstance;
    onFinish: () => Promise<void>;
    loading?: boolean;
}

const passwordRequirements = (
    <div className="text-xs">
        <div className="mb-1 font-semibold">Mật khẩu mới phải có từ 8 đến 32 ký tự.</div>
        <ul className="list-disc pl-4 m-0 space-y-0.5">
            <li>1 ký tự viết hoa (A-Z).</li>
            <li>1 ký tự số (0-9).</li>
            <li>1 ký tự đặc biệt (ví dụ: !, @, #, $, %, etc.).</li>
        </ul>
    </div>
);

export default function ResetPasswordForm({ form, onFinish, loading }: ResetFormStepProps) {
    return (
        <div className="animate-fade-in">
            <div className="mb-8 font-sans">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                    Khôi phục mật khẩu
                </h1>
                <p className="text-gray-500 text-base leading-relaxed">
                    Nhập mật khẩu mới của bạn và xác minh để tài khoản của bạn có thể được sử dụng.
                </p>
            </div>

            <LTTForm form={form} onFinish={onFinish} layout="vertical">
                <LTTFormItem
                    name="newPassword"
                    className="mb-4"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới" },
                        { min: 8, message: "Mật khẩu quá ngắn" },
                        { max: 32, message: "Mật khẩu quá dài" },
                        {
                            pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/,
                            message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt",
                        },
                    ]}
                >
                    <Input.Password
                        placeholder="Nhập mật khẩu mới"
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
                        { required: true, message: "Vui lòng nhập lại mật khẩu" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Mật khẩu không khớp!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder="Nhập lại mật khẩu mới"
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
                    Khôi phục mật khẩu
                </LTTButton>
            </LTTForm>
        </div>
    );
}
