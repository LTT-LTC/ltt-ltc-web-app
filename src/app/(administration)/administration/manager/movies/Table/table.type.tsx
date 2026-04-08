"use client";
import { ColumnsType } from "antd/es/table";
import { AdminMovie } from "../_mock/data";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import { Tag } from "antd";

const statusLabel: Record<string, string> = { now_showing: "Đang chiếu", coming_soon: "Sắp chiếu", ended: "Đã kết thúc" };
const statusColor: Record<string, string> = { now_showing: "success", coming_soon: "processing", ended: "default" };

export const columns = (
  onEdit: (record: AdminMovie) => void,
  onDelete: (id: string) => void
): ColumnsType<AdminMovie> => [
  {
    title: "STT",
    width: 60,
    key: "index",
    render: (_, __, index) => index + 1,
  },
  {
    title: "Tên phim",
    key: "title",
    dataIndex: "title",
    render: (text) => <span className="font-medium">{text}</span>,
  },
  {
    title: "Thể loại",
    key: "genre",
    dataIndex: "genre",
  },
  {
    title: "Thời lượng",
    key: "duration",
    dataIndex: "duration",
    render: (val) => <>{val} phút</>,
  },
  {
    title: "Phân loại",
    key: "ageRating",
    dataIndex: "ageRating",
    render: (val) => <Tag color="blue">{val}</Tag>,
  },
  {
    title: "Ngày chiếu",
    key: "releaseDate",
    dataIndex: "releaseDate",
  },
  {
    title: "Trạng thái",
    key: "status",
    dataIndex: "status",
    render: (val: string) => (
      <Tag color={statusColor[val] || "default"}>{statusLabel[val] || val}</Tag>
    ),
  },
  {
    title: "Thao tác",
    key: "actions",
    width: 120,
    render: (_, record) => (
      <div className="flex gap-2">
        <LTTButton variant="outline" onClick={() => onEdit(record)}>
          Sửa
        </LTTButton>
        <LTTButton variant="outline" danger onClick={() => onDelete(record.id)}>
          Xóa
        </LTTButton>
      </div>
    ),
  },
];
