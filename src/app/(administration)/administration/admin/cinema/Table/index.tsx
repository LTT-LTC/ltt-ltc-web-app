"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Form, Input, Tag, notification } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { formatDateTimeGmt7 } from "@/src/@core/utils/date";
import { AdminCinema, mockAdminCinemas } from "../_mock/data";

const statusLabel: Record<AdminCinema["status"], string> = {
  active: "Hoạt động",
  maintenance: "Bảo trì",
  closed: "Đóng cửa",
};

const statusColor: Record<AdminCinema["status"], string> = {
  active: "success",
  maintenance: "warning",
  closed: "error",
};

const CinemaListPage = () => {
  const [items, setItems] = useState<AdminCinema[]>(mockAdminCinemas);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminCinema | null>(null);

  const [form] = Form.useForm();

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q) || item.province.toLowerCase().includes(q));
  }, [items, search]);

  const columns: ColumnsType<AdminCinema> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên rạp",
      key: "name",
      dataIndex: "name",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      title: "Tỉnh/TP",
      key: "province",
      dataIndex: "province",
    },
    {
      title: "Địa chỉ",
      key: "address",
      dataIndex: "address",
    },
    {
      title: "Số phòng",
      key: "screenCount",
      dataIndex: "screenCount",
      align: "center",
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status: AdminCinema["status"]) => (
        <Tag color={statusColor[status]}>{statusLabel[status]}</Tag>
      ),
    },
    {
      title: "Cập nhật",
      key: "updatedAt",
      dataIndex: "updatedAt",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_, record) => (
        <div className="flex gap-2">
          <LTTButton variant="outline" onClick={() => openEdit(record)}>
            Sửa
          </LTTButton>
          <LTTButton variant="outline" danger onClick={() => handleDeleteOne(record.id)}>
            Xóa
          </LTTButton>
        </div>
      ),
    },
  ];

  const openCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ status: "active", screenCount: 0 });
    setIsModalOpen(true);
  };

  const openEdit = (item: AdminCinema) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleDeleteOne = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedKeys((prev) => prev.filter((key) => key !== id));
    notification.success({ message: "Đã xóa rạp" });
  };

  const handleDeleteSelected = () => {
    setItems((prev) => prev.filter((item) => !selectedKeys.includes(item.id)));
    notification.success({ message: `Đã xóa ${selectedKeys.length} rạp` });
    setSelectedKeys([]);
    setIsDeleteOpen(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const now = formatDateTimeGmt7();

      if (editingItem) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  ...values,
                  updatedAt: now,
                }
              : item,
          ),
        );
        notification.success({ message: "Cập nhật thành công" });
      } else {
        setItems((prev) => [
          ...prev,
          {
            id: `c-${Date.now()}`,
            tenantId: "tenant-001",
            createdAt: now,
            updatedAt: now,
            ...values,
          },
        ]);
        notification.success({ message: "Tạo mới thành công" });
      }
      setIsModalOpen(false);
    } catch {
      // Validation errors are handled by Form items.
    }
  };

  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quản trị hệ thống" },
          { title: <Link href="/administration/admin/cinema">Cinema Configuration</Link> },
        ]}
      />

      <div className="flex justify-between items-center mt-3 mb-4">
        <Input
          prefix={<SearchOutlined />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm kiếm rạp theo tên hoặc tỉnh/thành"
          style={{ width: 360 }}
        />

        <div className="flex gap-2">
          {selectedKeys.length > 0 && (
            <LTTButton variant="primary" danger onClick={() => setIsDeleteOpen(true)}>
              Xóa {selectedKeys.length}
            </LTTButton>
          )}
          <LTTButton variant="primary" onClick={openCreate}>
            Thêm rạp
          </LTTButton>
        </div>
      </div>

      <LTTCard height="table" title="Cinema Configuration" className="mt-3">
        <LTTTable
          rowKey="id"
          columns={columns}
          dataSource={filteredItems}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys),
          }}
        />
      </LTTCard>

      <LTTModal
        title={editingItem ? "Chỉnh sửa rạp" : "Thêm rạp mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        width={760}
      >
        <Form form={form} layout="vertical" className="grid grid-cols-2 gap-x-4">
          <div className="col-span-2">
            <LTTFormItem
              name="name"
              label="Tên rạp"
              rules={[{ required: true, message: "Tên rạp không được để trống" }]}
            >
              <LTTInput />
            </LTTFormItem>
          </div>
          <LTTFormItem name="province" label="Tỉnh/TP" rules={[{ required: true }]}> 
            <LTTInput />
          </LTTFormItem>
          <LTTFormItem name="screenCount" label="Số phòng" rules={[{ required: true }]}> 
            <LTTInput type="number" />
          </LTTFormItem>
          <div className="col-span-2">
            <LTTFormItem name="address" label="Địa chỉ" rules={[{ required: true }]}> 
              <LTTInput />
            </LTTFormItem>
          </div>
          <LTTFormItem name="phone" label="Điện thoại"> 
            <LTTInput />
          </LTTFormItem>
          <LTTFormItem name="email" label="Email"> 
            <LTTInput type="email" />
          </LTTFormItem>
          <LTTFormItem name="status" label="Trạng thái"> 
            <LTTSelect
              options={[
                { label: "Hoạt động", value: "active" },
                { label: "Bảo trì", value: "maintenance" },
                { label: "Đóng cửa", value: "closed" },
              ]}
            />
          </LTTFormItem>
        </Form>
      </LTTModal>

      <LTTModal
        title="Xác nhận xóa"
        open={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        onOk={handleDeleteSelected}
        okButtonProps={{ danger: true }}
        okText="Xóa"
      >
        <p>Bạn có chắc chắn muốn xóa {selectedKeys.length} rạp đã chọn?</p>
      </LTTModal>
    </>
  );
};

export default CinemaListPage;
