"use client";
import { useMemo, useState } from "react";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import LTTForm from "@/src/@core/component/AntD/LTTForm";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import { Form, notification } from "antd";
import Link from "next/link";
import { useLocalization } from "@/src/@core/hooks/use-localization";

import { columns } from "./table.type";
import StaffFilter from "../Filter";
import { StaffMember, mockStaff, staffRoles, mockAdminCinemas } from "../_mock/data";

const StaffListPage = () => {
  const { t } = useLocalization();
  const [items, setItems] = useState<StaffMember[]>(mockStaff);
  const [filters, setFilters] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StaffMember | null>(null);

  const [form] = Form.useForm();

  const filteredItems = useMemo(() => {
    let list = items;
    if (filters.roleId) {
      list = list.filter((s) => s.role === filters.roleId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((s) => s.fullname.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    return list;
  }, [items, filters]);

  const handleEdit = (record: StaffMember) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    notification.success({ message: t("admin.staff.toast.delete_success") });
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      role: "Box Office",
      cinemaId: "all",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const cinema = values.cinemaId === "all" ? { name: t("admin.staff.table.dash") } : mockAdminCinemas.find((c) => c.id === values.cinemaId);

      const payload = {
        ...values,
        cinemaName: cinema?.name || "",
      };

      if (editingItem) {
        setItems((prev) => prev.map((i) => i.id === editingItem.id ? { ...i, ...payload } : i));
        notification.success({ message: t("admin.staff.toast.update_success") });
      } else {
        setItems((prev) => [...prev, { ...payload, id: Date.now().toString(), joinedAt: new Date().toISOString().slice(0, 10), lastLogin: "" }]);
        notification.success({ message: t("admin.staff.toast.create_success") });
      }
      setIsModalOpen(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quản trị" },
          { title: <Link href="/administration/manager/staff">{t("admin.staff.title")}</Link> },
        ]}
      />
      <div className="flex justify-end mt-3 mb-4">
        <LTTButton variant="primary" onClick={handleAdd}>
          {t("admin.staff.add_employee")}
        </LTTButton>
      </div>

      <LTTCard height="table" title={t("admin.staff.title")} className="mt-3">
        <div className="search flex flex-row items-center gap-2 mt-0 mb-4">
          <StaffFilter onFilterChange={(f) => setFilters(f)} />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          items={[
            { key: "1", label: t("common.all") },
          ]}
        />
        <LTTTable
          rowKey="id"
          columns={columns(handleEdit, handleDelete)}
          dataSource={filteredItems}
        />
      </LTTCard>

      <LTTModal
        title={editingItem ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={onSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <LTTFormItem name="fullname" label="Họ tên" rules={[{ required: true, message: "Họ tên không được để trống" }]}>
              <LTTInput />
            </LTTFormItem>
            <LTTFormItem name="email" label="Email">
              <LTTInput type="email" />
            </LTTFormItem>
            <LTTFormItem name="phone" label="SĐT">
              <LTTInput />
            </LTTFormItem>
            <LTTFormItem name="role" label="Vai trò" rules={[{ required: true }]}>
              <LTTSelect
                options={staffRoles.map(r => ({ label: r, value: r }))}
              />
            </LTTFormItem>
            <LTTFormItem name="cinemaId" label="Rạp" rules={[{ required: true }]}>
              <LTTSelect
                options={[
                  { label: "Tất cả", value: "all" },
                  ...mockAdminCinemas.map(c => ({ label: c.name, value: c.id }))
                ]}
              />
            </LTTFormItem>
            <LTTFormItem name="status" label="Trạng thái">
              <LTTSelect
                options={[
                  { label: "Hoạt động", value: "active" },
                  { label: "Ngưng", value: "inactive" },
                  { label: "Tạm khóa", value: "suspended" }
                ]}
              />
            </LTTFormItem>
          </div>
        </Form>
      </LTTModal>
    </>
  );
};

export default StaffListPage;
