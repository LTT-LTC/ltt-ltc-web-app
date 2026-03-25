"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form } from "antd";

// Components
import LTTRenderIf from "@/src/@core/component/LTTRenderIf";
import RequestLinkStep from "./ResetPasswordLink";
import ResetFormStep from "./components/ResetPasswordForm";
import SuccessStep from "./components/ResetPasswordSuccess";

// Services
import { administrationService } from "@/src/services/administration-service/administration.service";

// Utils
import {
    useMessageInit,
    showNotificationSuccess,
    showNotificationError,
} from "@/src/@core/utils/message";

type ResetStep = "REQUEST_LINK" | "RESET_FORM" | "SUCCESS";

export default function ResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [form] = Form.useForm();
    const [step, setStep] = useState<ResetStep>("REQUEST_LINK");
    const [token, setToken] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // Initialize notification instance
    useMessageInit();

    // If token is present in URL query params, go directly to RESET_FORM step
    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (tokenParam) {
            setToken(tokenParam);
            setStep("RESET_FORM");
        }
    }, [searchParams]);

    // Step 1: Request password recovery — sends reset email
    const onRequestLink = async () => {
        const values = form.getFieldsValue();
        setLoading(true);

        try {
            await administrationService.authService.requestPasswordRecovery({
                userName: values.studentId,
            });

            showNotificationSuccess(
                "Kiểm tra Email và làm theo hướng dẫn để khôi phục mật khẩu.",
                { title: "Xác minh tài khoản thành công!", duration: 3 }
            );
            setTimeout(() => {
                router.push("/signin");
            }, 3000);
        } catch (error: any) {
            const message =
                error?.response?.data?.error?.message ||
                "Sai mã số sinh viên hoặc mã số sinh viên không tồn tại trong hệ thống";

            form.setFields([
                { name: "studentId", errors: [message] },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset password using token from email link
    const onResetPassword = async () => {
        const values = form.getFieldsValue();
        setLoading(true);

        try {
            await administrationService.authService.resetPassword({
                token: token,
                password: values.newPassword,
            });

            showNotificationSuccess("Hãy đăng nhập lại bằng mật khẩu mới.", {
                title: "Khôi phục mật khẩu thành công!",
                duration: 3,
            });
            setStep("SUCCESS");
            setTimeout(() => {
                router.push("/signin");
            }, 3000);
        } catch (error: any) {
            const message =
                error?.response?.data?.error?.message ||
                "Có lỗi xảy ra khi khôi phục mật khẩu. Vui lòng thử lại.";

            showNotificationError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4">
                <LTTRenderIf condition={step === "REQUEST_LINK"}>
                    <RequestLinkStep form={form} onFinish={onRequestLink} loading={loading} />
                </LTTRenderIf>

                <LTTRenderIf condition={step === "RESET_FORM"}>
                    <ResetFormStep form={form} onFinish={onResetPassword} loading={loading} />
                </LTTRenderIf>

                <LTTRenderIf condition={step === "SUCCESS"}>
                    <SuccessStep />
                </LTTRenderIf>
            </div>
        </div>
    );
}