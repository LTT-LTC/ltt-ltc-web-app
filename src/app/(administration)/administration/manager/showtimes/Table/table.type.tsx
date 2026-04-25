"use client";
import { ColumnsType } from "antd/es/table";
import { AdminShowtime } from "../_mock/data";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";

export const columns = (
  onEdit: (record: AdminShowtime) => void,
  onDelete: (id: string) => void
): ColumnsType<AdminShowtime> => [
    {
      title: "Phim",
      key: "movieTitle",
      dataIndex: "movieTitle",
      width: "25%",
    },
    {
      title: "Rạp",
      key: "cinemaName",
      dataIndex: "cinemaName",
      width: "15%",
    },
    {
      title: "Phòng",
      key: "screenNumber",
      dataIndex: "screenNumber",
      width: "10%",
      render: (val: number) => "Phòng " + val,
    },
    {
      title: "Ngày",
      key: "date",
      dataIndex: "date",
      width: "10%",
    },
    {
      title: "Giờ chiếu",
      key: "time",
      width: "15%",
      render: (_, record) => record.startTime + " - " + record.endTime,
    },
    {
      title: "Định dạng",
      key: "format",
      dataIndex: "format",
      width: "10%",
    },
    {
      title: "Giá",
      key: "basePrice",
      dataIndex: "basePrice",
      width: "10%",
      render: (val: number) => val.toLocaleString("vi-VN") + "đ",
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      width: "10%",
      render: (status: string) => {
        let color = "text-blue-500";
        let label = "Đã lên lịch";
        if (status === "cancelled") { color = "text-red-500"; label = "Đã hủy"; }
        else if (status === "completed") { color = "text-gray-500"; label = "Đã chiếu"; }
        return <span className={color}>{label}</span>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          <LTTButton variant="outline" onClick={() => onEdit(record)}>Sửa</LTTButton>
          <LTTConfirmDialog
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa suất chiếu này?"
            confirmText="Xóa"
            cancelText="Hủy"
            onConfirm={() => onDelete(record.id)}
            trigger={<LTTButton variant="outline" danger>Xóa</LTTButton>}
          />
        </div>
      ),
    },
  ];
