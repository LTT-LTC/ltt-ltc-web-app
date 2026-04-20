import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTForm from "@/src/@core/component/AntD/LTTForm";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTEyeIcon from "@/src/@core/component/LTTIcon/iconoir/eye";
import LTTEyeClosedIcon from "@/src/@core/component/LTTIcon/iconoir/eye-closed";
import Link from "next/link";
import {
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
} from "@/src/@core/const";
import { useEffect, useState } from "react";
import { Form } from "antd";
import { rules } from "@/src/@core/utils/rules";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { CustomerLoginOutputDto } from "@/src/services/customer-service/auth/models/output.model";
import { CustomerLoginInputDto } from "@/src/services/customer-service/auth/models/input.model";
import { customerService } from "@/src/services/customer-service/customer.service";
import { showNotificationSuccess, showNotificationError } from "@/src/@core/utils/message";
import { getOrCreateTenantOnClient } from "@/src/@core/utils/tenant";
import { getCookie, setCookie } from "@/src/@core/utils/cookie";
import { useLocalization } from "@/src/@core/hooks/use-localization";

interface LoginValidationError {
    members?: string[];
    message?: string;
}

interface LoginErrorShape {
    message?: string;
    response?: {
        data?: {
            error?: {
                message?: string;
                validationErrors?: LoginValidationError[];
            };
        };
    };
    validationErrors?: LoginValidationError[];
    error?: {
        message?: string;
        validationErrors?: LoginValidationError[];
    };
}

const FormDetail = () => {
    const { t } = useLocalization();
    const [showPassword, setShowPassword] = useState(false);
    const [form] = Form.useForm();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        getOrCreateTenantOnClient();
        const accessToken = getCookie(ACCESS_TOKEN_KEY);
        if (accessToken) {
            window.location.href = "/";
        }
    }, []);

    const { mutation, isLoading } = useLTTMutation<CustomerLoginOutputDto | null, CustomerLoginInputDto>({
        mutationFn: (input) => {
            return customerService.authService.loginAsync({
                identifier: input.identifier,
                password: input.password,
            });
        },
        onSuccess: (res: CustomerLoginOutputDto | null) => {
            if (res) {
                showNotificationSuccess(t("admin.auth.login.messages.login_success", "Login successful."));
                setCookie(ACCESS_TOKEN_KEY, res.accessToken);
                setCookie(REFRESH_TOKEN_KEY, res.refreshToken);
                setIsRedirecting(true);
                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);
            }
        },
        onError: (err: unknown) => {
            const error = err as LoginErrorShape;
            const validationErrors = error.validationErrors || error.error?.validationErrors || error.response?.data?.error?.validationErrors;
            const backendErrorMessage =
                error.message ||
                error.error?.message ||
                error.response?.data?.error?.message;

            if (validationErrors && validationErrors.length > 0) {
                const formErrors = validationErrors.map((errItem: LoginValidationError) => ({
                    name: errItem.members && errItem.members.length > 0 ?
                        (errItem.members[0].toLowerCase() === "userName" ? "identifier" : errItem.members[0])
                        : "identifier",
                    errors: [errItem.message || t("admin.auth.login.errors.invalid_data", "Invalid data")]
                }));
                form.setFields(formErrors);
            } else if (backendErrorMessage) {
                showNotificationError(backendErrorMessage);
                form.setFields([
                    { name: "identifier", errors: [] },
                    { name: "password", errors: [] }
                ]);
            } else {
                showNotificationError(t("admin.auth.login.errors.generic", "An error occurred, please try again later."));
                form.setFields([
                    { name: "identifier", errors: [] },
                    { name: "password", errors: [] }
                ]);
            }
        }
    });

    const onSubmit = (values: any) => {
        const identifier = values.identifier;
        const password = values.password;

        mutation({
            identifier,
            password,
        } as CustomerLoginInputDto);
    };

    return (
        <div>
            {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-5">
                <LTTGoogleButton />
            </div>
            <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                        Hoặc
                    </span>
                </div>
            </div> */}
            <LTTForm form={form} onFinish={onSubmit}>
                <div className="space-y-6">
                    <LTTFormItem
                        label="Email / Số điện thoại"
                        name="identifier"
                        rules={[rules.required]}
                        className="mb-3"
                    >
                        <LTTInput label="Email / Số điện thoại" showCount={false} allowClear={false} />
                    </LTTFormItem>

                    <LTTFormItem
                        label="Mật khẩu"
                        name="password"
                        rules={[rules.required]}
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
                    <div className="flex items-center justify-between mt-5">
                        <Link
                            href="/customer-reset-password"
                            className="text-sm text-brand-600 hover:text-brand-600 focus:text-brand-600 dark:!text-brand-400"
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <div className="mt-2">
                        <LTTButton
                            loading={isLoading || isRedirecting}
                            htmlType="submit"
                            className="w-full"
                            size="sm"
                        >
                            Đăng nhập
                        </LTTButton>
                    </div>
                </div>
            </LTTForm>

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Chưa có tài khoản?{" "}
                <Link
                    href="/customer-register"
                    className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
                >
                    Đăng ký ngay
                </Link>
            </div>
        </div>
    );
};

export default FormDetail;
