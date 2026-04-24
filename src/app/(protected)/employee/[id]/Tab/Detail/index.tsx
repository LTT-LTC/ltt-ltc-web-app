import LTTAvatar from "@/src/@core/component/AntD/LTTAvatar";
import { useEmployeeDetails } from "../../provider";
import LTTForm from "@/src/@core/component/AntD/LTTForm";
import { Form } from "antd";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTUploadAvatar from "@/src/@core/component/AntD/LTTUploadAvatar";
import { useEffect, useState } from "react";
import LTTRenderIf from "@/src/@core/component/LTTRenderIf";
import LTTDatePicker from "@/src/@core/component/AntD/LTTDatePicker";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import { rules } from "@/src/@core/utils/rules";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import EditPencil from "@/src/@core/component/LTTIcon/iconoir/edit-pencil";
import {
  EmployeeStatusLabels,
  EmployeeStatusOptions,
} from "@/src/enums/administration-service/employee/EmployeeStatus";
import { ActiveStatus } from "@/src/enums/administration-service/employee/ActiveStatus";

const EmployeeDetailProfileTab = () => {
  const { employeeDetail, updateEmployee } = useEmployeeDetails();
  const employeeAny = (employeeDetail.employee ?? {}) as any;
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState<boolean>(false);

  useEffect(() => {
    if (!isEdit) {
      form.setFields(
        form.getFieldsError().map((field) => ({
          name: field.name,
          errors: [],
        })),
      );
    }
  }, [isEdit]);

  const onSubmit = (values: any) => {
    const formData = new FormData();

    formData.append("name", values.fullName);
    formData.append("phoneNumber", values.phoneNumber);
    formData.append("code", values.code);
    formData.append(
      "dateOfBirth",
      values.dateOfBirth ? values.dateOfBirth.toISOString() : "",
    );
    formData.append("positionId", values.positionId);
    formData.append(
      "isActive",
      values.status === ActiveStatus.Active ? "true" : "false",
    );
    formData.append("otherEmail", values.otherEmail);
    formData.append("email", values.organizationEmail);
    formData.append(
      "joinedDate",
      values.joinDate ? values.joinDate.toISOString() : "",
    );
    formData.append("organizationUnitId", values.organizationUnitId);

    const input = {
      employeeId: employeeDetail.employeeId,
      body: formData,
    };

    updateEmployee?.action(input);
  };

  return (
    <LTTForm
      loading={
        employeeDetail.isEmployeeDetailLoading ||
        updateEmployee?.isUpdateEmployeeLoading
      }
      initialValues={{
        fullName: employeeDetail.employee?.name,
        phoneNumber: employeeDetail.employee?.phoneNumber,
        code: employeeDetail.employee?.code,
        dateOfBirth: employeeAny?.dateOfBirth
          ? new Date(employeeAny.dateOfBirth)
          : undefined,
        positionId: employeeAny?.positionId,
        status: employeeDetail.employee?.isActive
          ? ActiveStatus.Active
          : ActiveStatus.Deactive,
        otherEmail: employeeAny?.otherEmail,
        organizationEmail: employeeDetail.employee?.email,
        joinDate: employeeAny?.joinedDate
          ? new Date(employeeAny.joinedDate)
          : undefined,
        organizationUnitId: employeeDetail.employee?.organizationUnitId,
        avatarUrl: employeeDetail.employee?.avatarUrl,
      }}
      className="grid grid-cols-2 gap-4"
      form={form}
      onFinish={onSubmit}
    >
      {/* Avatar */}
      <div className="col-span-2 flex justify-start">
        <LTTRenderIf condition={!isEdit}>
          <LTTAvatar
            src={employeeDetail.employee?.avatarUrl}
            shape="circle"
            size={128}
          />
        </LTTRenderIf>
        <LTTRenderIf condition={isEdit}>
          <LTTUploadAvatar
            src={employeeDetail.employee?.avatarUrl}
            shape="circle"
            size={128}
          />
        </LTTRenderIf>
      </div>

      {/* left form */}
      <div className="grid grid-cols-1 gap-4">
        <LTTFormItem
          rules={isEdit ? [rules.required] : []}
          text={employeeDetail.employee?.name}
          isShowText={!isEdit}
          label="Họ và tên"
          name="fullName"
        >
          <LTTInput label="Họ và tên" />
        </LTTFormItem>
        <LTTFormItem
          rules={isEdit ? [rules.required] : []}
          text={employeeDetail.employee?.phoneNumber}
          isShowText={!isEdit}
          label="Số điện thoại"
          name="phoneNumber"
        >
          <LTTInput label="Số điện thoại" />
        </LTTFormItem>
        <LTTFormItem
          rules={isEdit ? [rules.required] : []}
          text={employeeDetail.employee?.code}
          isShowText={!isEdit}
          label="Mã số nhân sự"
          name="code"
        >
          <LTTInput label="Mã số nhân sự" />
        </LTTFormItem>
        <LTTFormItem
          text={employeeAny?.dateOfBirth}
          rules={isEdit ? [rules.required] : []}
          isShowText={!isEdit}
          label="Ngày/tháng/năm sinh"
          name="dateOfBirth"
        >
          <LTTDatePicker label="Ngày/tháng/năm sinh" />
        </LTTFormItem>
        <LTTFormItem
          // rules={isEdit ? [rules.required] : []}
          text={employeeAny?.positionName ?? ""}
          isShowText={!isEdit}
          label="Vai trò"
          name="positionId"
        >
          <LTTSelect options={[]} label="Vai trò" />
        </LTTFormItem>
      </div>

      {/* right form */}
      <div className="grid grid-cols-1 gap-4">
        <LTTFormItem
          rules={isEdit ? [rules.required] : []}
          text={EmployeeStatusLabels(
            employeeDetail.employee?.isActive
              ? ActiveStatus.Active
              : ActiveStatus.Deactive,
          )}
          isShowText={!isEdit}
          label="Trạng thái"
          name="status"
        >
          <LTTSelect options={EmployeeStatusOptions} label="Trạng thái" />
        </LTTFormItem>
        <LTTFormItem
          rules={isEdit ? [rules.required] : []}
          text={employeeAny?.otherEmail}
          isShowText={!isEdit}
          label="Email cá nhân"
          name="otherEmail"
        >
          <LTTInput type="email" label="Email cá nhân" />
        </LTTFormItem>
        <LTTFormItem
          rules={isEdit ? [rules.required] : []}
          text={employeeDetail.employee?.email}
          isShowText={!isEdit}
          label="Email tổ chức"
          name="organizationEmail"
        >
          <LTTInput type="email" label="Email tổ chức" />
        </LTTFormItem>
        <LTTFormItem
          rules={isEdit ? [rules.required] : []}
          text={employeeAny?.joinedDate}
          isShowText={!isEdit}
          label="Thời gian gia nhập"
          name="joinDate"
        >
          <LTTDatePicker label="Thời gian gia nhập" />
        </LTTFormItem>
        <LTTFormItem
          // rules={isEdit ? [rules.required] : []}
          text={employeeDetail.employee?.organizationUnitName ?? ""}
          isShowText={!isEdit}
          label="Phòng ban"
          name="organizationUnitId"
        >
          <LTTSelect options={[]} label="Phòng ban" />
        </LTTFormItem>
      </div>

      {/* Button */}
      <div className="col-span-2 flex justify-end">
        <LTTRenderIf condition={isEdit}>
          <LTTButton className="mr-3" onClick={() => setIsEdit(false)}>
            Hủy
          </LTTButton>
          <LTTButton htmlType="submit">Lưu</LTTButton>
        </LTTRenderIf>
        <LTTRenderIf condition={!isEdit}>
          <LTTButton
            onClick={() => setIsEdit(true)}
            startIcon={<EditPencil variant="primary" />}
          >
            Chỉnh sửa
          </LTTButton>
        </LTTRenderIf>
      </div>
    </LTTForm>
  );
};

export default EmployeeDetailProfileTab;
