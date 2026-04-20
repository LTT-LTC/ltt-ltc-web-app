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
import { LoginOutputDto } from "@/src/services/administration-service/auth/models/output.model";
import { LoginInputDto } from "@/src/services/administration-service/auth/models/input.model";
import { administrationService } from "@/src/services/administration-service/administration.service";
import { getCookie, removeCookie, setCookie } from "@/src/@core/utils/cookie";
import LTTGoogleButton from "@/src/@core/component/AntD/LTTButton/LTTGoogleButton";
import { showNotificationSuccess, showNotificationError } from "@/src/@core/utils/message";
import { getAdminHomePathByRole, resolveAdminRoleFromToken } from "@/src/@core/utils/admin-auth";
import {
    getOrCreateTenantOnClient,
    syncTenantCookieFromLocalStorage,
} from "@/src/@core/utils/tenant";
import { useLocalization } from "@/src/@core/hooks/use-localization";

interface LoginValidationError {
    members?: string[];
    message?: string;
}

interface LoginBackendError {
    message?: string;
    validationErrors?: LoginValidationError[];
}

interface LoginErrorShape {
    message?: string;
    response?: {
        data?: {
            error?: LoginBackendError;
        };
    };
    validationErrors?: LoginValidationError[];
    error?: LoginBackendError;
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
            const role = resolveAdminRoleFromToken(accessToken);
            if (role) {
                window.location.href = getAdminHomePathByRole(role);
                return;
            }

            removeCookie(ACCESS_TOKEN_KEY);
            removeCookie(REFRESH_TOKEN_KEY);
        }
    }, []);

    const { mutation, isLoading } = useLTTMutation<LoginOutputDto | null, LoginInputDto>({
        mutationFn: (input) => {
            return administrationService.authService.loginAsync({
                username: input.username,
                password: input.password,
            });
        },
        onSuccess: (res: LoginOutputDto | null) => {
            if (res) {
                syncTenantCookieFromLocalStorage();

                const role = resolveAdminRoleFromToken(res.accessToken);
                if (!role) {
                    removeCookie(ACCESS_TOKEN_KEY);
                    removeCookie(REFRESH_TOKEN_KEY);
                    showNotificationError(t("admin.auth.login.errors.no_admin_access", "This account does not have access to the administration portal."));
                    return;
                }

                showNotificationSuccess(t("admin.auth.login.messages.login_success", "Login successful."));
                setCookie(ACCESS_TOKEN_KEY, res.accessToken);
                setCookie(REFRESH_TOKEN_KEY, res.refreshToken);
                setIsRedirecting(true);
                setTimeout(() => {
                    window.location.href = getAdminHomePathByRole(role);
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
                    name: errItem.members && errItem.members.length > 0 ? errItem.members[0].toLowerCase() : "username",
                    errors: [errItem.message || t("admin.auth.login.errors.invalid_data", "Invalid data")]
                }));
                form.setFields(formErrors);
            } else if (backendErrorMessage) {
                showNotificationError(backendErrorMessage);
                form.setFields([
                    { name: "username", errors: [] },
                    { name: "password", errors: [] }
                ]);
            } else {
                showNotificationError(t("admin.auth.login.errors.generic", "An error occurred, please try again later."));
                form.setFields([
                    { name: "username", errors: [] },
                    { name: "password", errors: [] }
                ]);
            }
        }
    });

    const onSubmit = (values: LoginInputDto) => {
        const username = values.username;
        const password = values.password;

        mutation({
            username,
            password,
        } as LoginInputDto);
    };



    return (
        <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-5">
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
            </div>
            <LTTForm form={form} onFinish={onSubmit}>
                <div className="space-y-6">


                    <LTTFormItem
                        label="Tài khoản"
                        name="username"
                        rules={[rules.required]}
                        className="mb-3"
                    >
                        <LTTInput label="Tài khoản" showCount={false} allowClear={false} />
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
                            href="/administration-reset-password"
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
        </div>
    );
};

export default FormDetail;
