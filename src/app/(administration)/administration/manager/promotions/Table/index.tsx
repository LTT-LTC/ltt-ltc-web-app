"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Form, Input, Progress, Tag, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CopyOutlined } from "@ant-design/icons";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { Promotion, mockPromotions } from "../_mock/data";

const typeLabel: Record<Promotion["type"], string> = {
  percentage: "Giảm %",
  fixed: "Giảm cố định",
  buy_x_get_y: "Mua X tặng Y",
  gift_card: "Gift Card",
};

const statusLabel: Record<Promotion["status"], string> = {
  active: "Đang chạy",
  expired: "Hết hạn",
  draft: "Bản nháp",
};

const statusColor: Record<Promotion["status"], string> = {
  active: "success",
  expired: "default",
  draft: "processing",
};

const PromotionsListPage = () => {
  const [items, setItems] = useState<Promotion[]>(mockPromotions);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Promotion | null>(null);

  const [form] = Form.useForm();

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q));
  }, [items, search]);

  const columns: ColumnsType<Promotion> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên",
      key: "name",
      dataIndex: "name",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      title: "Mã",
      key: "code",
      dataIndex: "code",
      render: (value: string) => (
        <button
          className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 font-mono text-xs"
          onClick={() => {
            void navigator.clipboard.writeText(value);
            notification.success({ message: "Đã sao chép mã" });
          }}
        >
          {value}
          <CopyOutlined />
        </button>
      ),
    },
    {
      title: "Loại",
      key: "type",
      dataIndex: "type",
      render: (value: Promotion["type"]) => typeLabel[value],
    },
    {
      title: "Giá trị",
      key: "value",
      dataIndex: "value",
      render: (value: number, record) => {
        if (record.type === "percentage") return `${value}%`;
        if (record.type === "fixed" || record.type === "gift_card") return `${value.toLocaleString("vi-VN")}đ`;
        return "—";
      },
    },
    {
      title: "Sử dụng",
      key: "usage",
      render: (_, record) => (
        <div className="min-w-[140px]">
          <div className="text-xs mb-1">{record.usedCount}/{record.usageLimit}</div>
          <Progress
            percent={Math.min(100, Math.round((record.usedCount / Math.max(1, record.usageLimit)) * 100))}
            showInfo={false}
            size={{ height: 6 }}
          />
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "period",
      render: (_, record) => `${record.startDate} → ${record.endDate}`,
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (value: Promotion["status"]) => (
        <Tag color={statusColor[value]}>{statusLabel[value]}</Tag>
      ),
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
    form.setFieldsValue({
      type: "percentage",
      value: 10,
      minOrderValue: 0,
      maxDiscount: 50000,
      usageLimit: 100,
      applicableTo: "Tất cả",
      status: "draft",
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: Promotion) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleDeleteOne = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedKeys((prev) => prev.filter((key) => key !== id));
    notification.success({ message: "Đã xóa khuyến mãi" });
  };

  const handleDeleteSelected = () => {
    setItems((prev) => prev.filter((item) => !selectedKeys.includes(item.id)));
    notification.success({ message: `Đã xóa ${selectedKeys.length} khuyến mãi` });
    setSelectedKeys([]);
    setIsDeleteOpen(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        value: Number(values.value),
        minOrderValue: Number(values.minOrderValue),
        maxDiscount: Number(values.maxDiscount),
        usageLimit: Number(values.usageLimit),
      } as Omit<Promotion, "id" | "usedCount" | "createdAt">;

      if (editingItem) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  ...payload,
                }
              : item,
          ),
        );
        notification.success({ message: "Cập nhật thành công" });
      } else {
        setItems((prev) => [
          {
            id: `p-${Date.now()}`,
            ...payload,
            usedCount: 0,
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...prev,
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
          { title: "Quản lý rạp" },
          { title: <Link href="/administration/manager/promotions">Promotion & Giftcard</Link> },
        ]}
      />

      <div className="flex justify-between items-center mt-3 mb-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên hoặc mã khuyến mãi"
          style={{ width: 360 }}
        />

        <div className="flex gap-2">
          {selectedKeys.length > 0 && (
            <LTTButton variant="primary" danger onClick={() => setIsDeleteOpen(true)}>
              Xóa {selectedKeys.length}
            </LTTButton>
          )}
          <LTTButton variant="primary" onClick={openCreate}>
            Thêm khuyến mãi
          </LTTButton>
        </div>
      </div>

      <LTTCard height="table" title="Khuyến mãi & Gift Cards" className="mt-3">
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
        title={editingItem ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        width={760}
      >
        <Form form={form} layout="vertical" className="grid grid-cols-2 gap-x-4">
          <div className="col-span-2">
            <LTTFormItem name="name" label="Tên" rules={[{ required: true, message: "Tên không được để trống" }]}> 
              <LTTInput />
            </LTTFormItem>
          </div>
          <LTTFormItem name="code" label="Mã" rules={[{ required: true, message: "Mã không được để trống" }]}> 
            <LTTInput />
          </LTTFormItem>
          <LTTFormItem name="type" label="Loại" rules={[{ required: true }]}> 
            <LTTSelect
              options={[
                { label: "Giảm %", value: "percentage" },
                { label: "Giảm cố định", value: "fixed" },
                { label: "Mua X tặng Y", value: "buy_x_get_y" },
                { label: "Gift Card", value: "gift_card" },
              ]}
            />
          </LTTFormItem>
          <LTTFormItem name="value" label="Giá trị"> 
            <LTTInput type="number" />
          </LTTFormItem>
          <LTTFormItem name="usageLimit" label="Giới hạn sử dụng"> 
            <LTTInput type="number" />
          </LTTFormItem>
          <LTTFormItem name="minOrderValue" label="Đơn tối thiểu"> 
            <LTTInput type="number" />
          </LTTFormItem>
          <LTTFormItem name="maxDiscount" label="Giảm tối đa"> 
            <LTTInput type="number" />
          </LTTFormItem>
          <LTTFormItem name="startDate" label="Ngày bắt đầu"> 
            <LTTInput type="date" />
          </LTTFormItem>
          <LTTFormItem name="endDate" label="Ngày kết thúc"> 
            <LTTInput type="date" />
          </LTTFormItem>
          <LTTFormItem name="applicableTo" label="Áp dụng cho" className="col-span-2"> 
            <LTTInput />
          </LTTFormItem>
          <LTTFormItem name="status" label="Trạng thái"> 
            <LTTSelect
              options={[
                { label: "Bản nháp", value: "draft" },
                { label: "Đang chạy", value: "active" },
                { label: "Hết hạn", value: "expired" },
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
        <p>Bạn có chắc chắn muốn xóa {selectedKeys.length} khuyến mãi đã chọn?</p>
      </LTTModal>
    </>
  );
};

export default PromotionsListPage;
