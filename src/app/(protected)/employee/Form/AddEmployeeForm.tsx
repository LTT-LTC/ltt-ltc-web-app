"use client";

import { useState } from "react";
import { Form, Modal } from "antd";
import dayjs from "dayjs";

import LTTModal from "@/src/@core/component/AntD/LTTModal";
import LTTForm from "@/src/@core/component/AntD/LTTForm";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import LTTDatePicker from "@/src/@core/component/AntD/LTTDatePicker";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import { rules } from "@/src/@core/utils/rules";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { administrationService } from "@/src/services/administration-service/administration.service";
import { EmployeeOutputDto } from "@/src/services/administration-service/employee/models/output.model";
import { showNotificationSuccess } from "@/src/@core/utils/message";

// TODO: Replace with actual data from API
const roleOptions = [
    { label: "Chủ nhiệm", value: "chu-nhiem" },
    { label: "Phó chủ nhiệm", value: "pho-chu-nhiem" },
    { label: "Kỹ thuật viên", value: "ky-thuat-vien" },
    { label: "Thành viên", value: "thanh-vien" },
];

const departmentOptions = [
    { label: "Ban kỹ thuật", value: "ban-ky-thuat" },
    { label: "Ban truyền thông", value: "ban-truyen-thong" },
    { label: "Ban nhân sự", value: "ban-nhan-su" },
    { label: "Ban sự kiện", value: "ban-su-kien" },
];

interface AddEmployeeFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AddEmployeeForm = ({ open, onClose, onSuccess }: AddEmployeeFormProps) => {
    const [form] = Form.useForm();

    const { mutation, isLoading } = useLTTMutation<string, FormData>({
        mutationFn: (formData) =>
            administrationService.employeeService.create(formData as any),
        onSuccess: () => {
            showNotificationSuccess("Thêm thành viên mới thành công.");
            form.resetFields();
            onClose();
            onSuccess?.();
        },
    });

    const onFinish = (values: any) => {
        const formData = new FormData();
        formData.append("Name", values.name);
        formData.append("Email", values.email);
        formData.append("Code", values.code);
        // formData.append("PositionId", values.positionId);
        // formData.append("OrganizationUnitId", values.organizationUnitId);

        if (values.otherEmail) formData.append("OtherEmail", values.otherEmail);
        if (values.phone) formData.append("PhoneNumber", values.phone);
        if (values.dateOfBirth) formData.append("DateOfBirth", dayjs(values.dateOfBirth).toISOString());
        if (values.joinDate) formData.append("JoinedDate", dayjs(values.joinDate).toISOString());

        mutation(formData);
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <LTTModal
            title={<span className="text-[22px] font-bold">Thêm thành viên mới</span>}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={750}
            destroyOnHidden
            className="[&_.ant-modal-content]:!p-10 [&_.ant-modal-content]:!rounded-3xl"
        >

            <LTTForm form={form} onFinish={onFinish}>
                <div className="grid grid-cols-2 gap-x-5">
                    {/* Row 1 */}
                    <LTTFormItem
                        label="Họ và tên"
                        name="name"
                        required
                        rules={[rules.required]}
                    >
                        <LTTInput label="Họ và tên" showCount={false} />
                    </LTTFormItem>

                    <LTTFormItem
                        label="Số điện thoại"
                        name="phone"
                        required
                        rules={[rules.required]}>
                        <LTTInput label="Số điện thoại" showCount={false} />
                    </LTTFormItem>

                    {/* Row 2 */}
                    <LTTFormItem
                        label="Email cá nhân"
                        name="email"
                        required
                        rules={[
                            rules.required,
                            { type: "email", message: "Email không hợp lệ" },
                        ]}
                    >
                        <LTTInput label="Email cá nhân" showCount={false} />
                    </LTTFormItem>

                    <LTTFormItem
                        label="Mã số sinh viên"
                        name="code"
                        required
                        rules={[rules.required]}
                    >
                        <LTTInput label="Mã số sinh viên" showCount={false} />
                    </LTTFormItem>

                    {/* Row 3 - Other Email */}
                    <LTTFormItem
                        label="Email khác"
                        name="otherEmail"
                        rules={[
                            { type: "email", message: "Email không hợp lệ" },
                        ]}
                    >
                        <LTTInput label="Email khác" showCount={false} />
                    </LTTFormItem>

                    <div /> {/* spacer */}

                    {/* Row 4 */}
                    <LTTFormItem label="Ngày, tháng, năm sinh" name="dateOfBirth">
                        <LTTDatePicker
                            label="ngày sinh"
                            format="DD/MM/YYYY"
                            className="w-full"
                        />
                    </LTTFormItem>

                    <LTTFormItem label="Thời gian gia nhập CLB" name="joinDate">
                        <LTTDatePicker
                            label="thời gian gia nhập"
                            format="DD/MM/YYYY"
                            className="w-full"
                        />
                    </LTTFormItem>

                    {/* Row 5 */}
                    <LTTFormItem
                        label="Vai trò"
                        name="positionId"
                    >
                        <LTTSelect
                            label="Vai trò"
                            options={roleOptions}
                            className="w-full"
                        />
                    </LTTFormItem>

                    <LTTFormItem
                        label="Ban"
                        name="organizationUnitId"
                    >
                        <LTTSelect
                            label="Ban"
                            options={departmentOptions}
                            className="w-full"
                        />
                    </LTTFormItem>
                </div>

                {/* Footer buttons */}
                <div className="flex justify-center gap-3 mt-4">
                    <LTTButton variant="outline" onClick={handleCancel}>
                        Hủy
                    </LTTButton>
                    <LTTButton htmlType="submit" loading={isLoading}>
                        Thêm
                    </LTTButton>
                </div>
            </LTTForm>
        </LTTModal>
    );
};

export default AddEmployeeForm;
