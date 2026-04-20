"use client";
import { ColumnsType } from "antd/es/table"; import { FnBItem } from "../_mock/data";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import { Space } from "antd";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";

const catLabel: Record<string, string> = { popcorn: "Bắp rang", drink: "Nước uống", combo: "Combo", snack: "Snack", other: "Khác" };
const statusColor: Record<string, string> = { available: "text-green-700 bg-green-100", out_of_stock: "text-amber-700 bg-amber-100", discontinued: "text-gray-500 bg-gray-100" };
const statusLabel: Record<string, string> = { available: "Có sẵn", out_of_stock: "Hết hàng", discontinued: "Ngưng bán" };

const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const columns = (
  onEdit: (record: FnBItem) => void,
  onDelete: (id: string) => void
): ColumnsType<FnBItem> => [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category: string) => <span>{catLabel[category]}</span>,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (price: number) => <span>{formatVND(price)}</span>,
    },
    {
      title: "Giá vốn",
      dataIndex: "cost",
      key: "cost",
      render: (cost: number) => <span className="text-gray-500">{formatVND(cost)}</span>,
    },
    {
      title: "Lợi nhuận",
      key: "profit",
      render: (_, record) => <span className="text-green-600 font-medium">{formatVND(record.price - record.cost)}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={`${statusColor[status] || ""} px-2 py-1 rounded inline-block text-xs font-medium`}>
          {statusLabel[status]}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <LTTButton size="sm" variant="outline" onClick={() => onEdit(record)}>
            Sửa
          </LTTButton>
          <LTTConfirmDialog
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
            confirmText="Xóa"
            cancelText="Hủy"
            onConfirm={() => onDelete(record.id)}
            trigger={<LTTButton size="sm" danger>Xóa</LTTButton>}
          />
        </Space>
      ),
    },
  ];
