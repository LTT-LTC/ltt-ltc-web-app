"use client";
import { Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { StaffMember } from "../_mock/data";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";

const statusColor: Record<string, string> = {
  active: "success",
  inactive: "default",
  suspended: "error",
};
const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Ngưng",
  suspended: "Tạm khóa",
};

export const columns = (
  handleEdit: (record: StaffMember) => void,
  handleDelete: (id: string) => void
): ColumnsType<StaffMember> => [
    {
      title: "Họ tên",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Rạp",
      dataIndex: "cinemaName",
      key: "cinemaName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColor[status] || "default"}>
          {statusLabel[status] || status}
        </Tag>
      ),
    },
    {
      title: "Đăng nhập cuối",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (text: string) => text || "—",
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <LTTButton variant="outline" onClick={() => handleEdit(record)}>
            Sửa
          </LTTButton>
          <LTTConfirmDialog
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa nhân viên này?"
            confirmText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
            trigger={<LTTButton danger variant="outline">Xoá</LTTButton>}
          />
        </Space>
      ),
    },
  ];
