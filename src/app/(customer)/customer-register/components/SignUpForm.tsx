"use client";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTForm from "@/src/@core/component/AntD/LTTForm";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTEyeIcon from "@/src/@core/component/LTTIcon/iconoir/eye";
import LTTEyeClosedIcon from "@/src/@core/component/LTTIcon/iconoir/eye-closed";
import Link from "next/link";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/src/@core/const";
import { useState } from "react";
import { Form } from "antd";
import { rules } from "@/src/@core/utils/rules";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { CustomerLoginOutputDto } from "@/src/services/customer-service/auth/models/output.model";
import { CustomerRegisterInputDto } from "@/src/services/customer-service/auth/models/input.model";
import { customerService } from "@/src/services/customer-service/customer.service";
import { setCookie } from "@/src/@core/utils/cookie";
import { showNotificationSuccess, showNotificationError } from "@/src/@core/utils/message";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import LTTDatePicker from "@/src/@core/component/AntD/LTTDatePicker";
import dayjs from "dayjs";

const SignUpForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [form] = Form.useForm();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const { mutation, isLoading } = useLTTMutation<CustomerLoginOutputDto | null, CustomerRegisterInputDto>({
        mutationFn: (input) => {
            return customerService.authService.registerAsync(input);
        },
        onSuccess: (res: CustomerLoginOutputDto | null) => {
            if (res) {
                showNotificationSuccess("Đăng ký thành công.");
                setCookie(ACCESS_TOKEN_KEY, res.accessToken);
                setCookie(REFRESH_TOKEN_KEY, res.refreshToken);
                setIsRedirecting(true);
                setTimeout(() => {
                    const returnUrl = new URLSearchParams(window.location.search).get("returnUrl") || "/my-ltc";
                    window.location.href = returnUrl;
                }, 1000);
            }
        },
        onError: (err: any) => {
            // Handle error from backend
            const backendError = err?.response?.data?.error || err?.error;
            if (backendError && backendError.validationErrors && backendError.validationErrors.length > 0) {
                const validationErrors = backendError.validationErrors;
                const formErrors = validationErrors.map((errItem: any) => ({
                    name: errItem.members && errItem.members.length > 0 ?
                        (errItem.members[0].charAt(0).toLowerCase() + errItem.members[0].slice(1))
                        : "emailAddress",
                    errors: [errItem.message]
                }));
                form.setFields(formErrors);
            } else if (backendError && backendError.message) {
                // Generate push notification for generic message
                showNotificationError(backendError.message);
                form.setFields([{ name: "emailAddress", errors: [] }]);
            } else {
                showNotificationError("Có lỗi xảy ra, vui lòng thử lại sau.");
                form.setFields([{ name: "emailAddress", errors: [] }]);
            }
        }
    });

    const onSubmit = (values: any) => {
        const payload: CustomerRegisterInputDto = {
            ...values,
            dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).toISOString() : undefined,
        };

        mutation(payload);
    };

    return (
        <div>
            <LTTForm form={form} onFinish={onSubmit} layout="vertical">
                <div className="space-y-4">
                    <LTTFormItem
                        label="Họ và tên"
                        name="name"
                        rules={[rules.required]}
                        className="mb-3"
                    >
                        <LTTInput label="Họ và tên" showCount={false} allowClear={false} />
                    </LTTFormItem>

                    <LTTFormItem
                        label="Email"
                        name="emailAddress"
                        rules={[rules.required, rules.email]}
                        className="mb-3"
                    >
                        <LTTInput label="Email" showCount={false} allowClear={false} />
                    </LTTFormItem>

                    <LTTFormItem
                        label="Số điện thoại"
                        name="phoneNumber"
                        className="mb-3"
                    >
                        <LTTInput label="Số điện thoại" showCount={false} allowClear={false} />
                    </LTTFormItem>

                    <div className="flex gap-4">
                        <LTTFormItem
                            label="Giới tính"
                            name="gender"
                            className="mb-3 flex-1"
                        >
                            <LTTSelect
                                label="Giới tính"
                                options={[
                                    { label: "Nam", value: "Male" },
                                    { label: "Nữ", value: "Female" },
                                    { label: "Khác", value: "Other" },
                                ]}
                            />
                        </LTTFormItem>

                        <LTTFormItem
                            label="Ngày sinh"
                            name="dateOfBirth"
                            className="mb-3 flex-1"
                        >
                            <LTTDatePicker label="Ngày sinh" className="w-full h-[40px]" />
                        </LTTFormItem>
                    </div>

                    <LTTFormItem
                        label="Mật khẩu"
                        name="password"
                        rules={[rules.required, rules.password]}
                        className="mb-3"
                    >
                        <LTTInput
                            label="Mật khẩu"
                            showCount={false}
                            allowClear={false}
                            type={showPassword ? "text" : "password"}
                            suffix={
                                showPassword ? (
                                    <LTTEyeIcon
                                        width={20}
                                        height={20}
                                        onClick={() => setShowPassword(false)}
                                        variant="primary"
                                    />
                                ) : (
                                    <LTTEyeClosedIcon
                                        onClick={() => setShowPassword(true)}
                                        width={20}
                                        height={20}
                                        variant="primary"
                                    />
                                )
                            }
                        />
                    </LTTFormItem>

                    <div className="mt-6">
                        <LTTButton
                            loading={isLoading || isRedirecting}
                            htmlType="submit"
                            className="w-full"
                            size="sm"
                        >
                            Đăng ký
                        </LTTButton>
                    </div>
                </div>
            </LTTForm>
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Đã có tài khoản?{" "}
                <Link
                    href="/customer-login"
                    className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
                >
                    Đăng nhập
                </Link>
            </div>
        </div>
    );
};

export default SignUpForm;
