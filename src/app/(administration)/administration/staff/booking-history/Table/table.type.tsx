import { ColumnsType } from "antd/es/table";
import { StaffBooking } from "../../../_shared/staffMockData";
import { Tag, Space, Tooltip } from "antd";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import { Printer, RefreshCcw } from "lucide-react";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const columns = (
  handlePrint: (record: StaffBooking) => void,
  handleRefund: (record: StaffBooking) => void
): ColumnsType<StaffBooking> => [
  {
    title: "Mã Đơn / Thời gian",
    dataIndex: "id",
    key: "id",
    width: 170,
    render: (id: string, record: StaffBooking) => (
      <div>
        <div className="font-semibold text-xs text-primary-shadcn">{id}</div>
        <div className="text-xs text-muted-shadcn-foreground mt-0.5">
          {record.createdAt}
        </div>
      </div>
    ),
  },
  {
    title: "Khách hàng",
    dataIndex: "customerName",
    key: "customerName",
    width: 150,
    ellipsis: true,
    render: (name: string, record: StaffBooking) => (
      <div>
        <div className="font-medium text-gray-900 text-sm truncate">{name}</div>
        <div className="text-xs text-muted-shadcn-foreground">{record.customerPhone}</div>
      </div>
    ),
  },
  {
    title: "Suất chiếu",
    dataIndex: "movieTitle",
    key: "movieTitle",
    render: (title: string, record: StaffBooking) => (
      <div>
        <div className="font-semibold text-gray-900 text-sm">{title}</div>
        <div className="text-xs text-muted-shadcn-foreground mt-0.5">
          {record.showtime} · Rạp {record.screenNumber}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {record.seats.length > 0 && (
            <span>Ghế: <span className="font-medium">{record.seats.join(", ")}</span></span>
          )}
          {record.products.length > 0 && (
            <div>{record.products.map(p => `${p.qty}× ${p.name}`).join(" · ")}</div>
          )}
        </div>
      </div>
    ),
  },
  {
    title: "Tổng tiền",
    key: "totalAmount",
    width: 130,
    render: (_, record: StaffBooking) => (
      <div>
        <div className="font-bold text-gray-900 text-sm">{formatCurrency(record.totalAmount)}</div>
        <div className="text-[11px] text-muted-shadcn-foreground uppercase tracking-wider mt-0.5">
          {record.paymentMethod}
        </div>
      </div>
    ),
  },
  {
    title: "Trạng thái",
    key: "status",
    dataIndex: "status",
    width: 120,
    align: "center",
    render: (status: string) => {
      const map: Record<string, { color: string; label: string }> = {
        confirmed:  { color: "blue",    label: "Đã xác nhận" },
        checked_in: { color: "green",   label: "Đã check-in" },
        cancelled:  { color: "red",     label: "Đã hủy" },
      };
      const { color, label } = map[status] ?? { color: "default", label: status };
      return <Tag color={color}>{label}</Tag>;
    },
  },
  {
    title: "Thao tác",
    key: "action",
    width: 100,
    align: "center",
    render: (_, record: StaffBooking) => (
      <Space size="small">
        <Tooltip title="In vé">
          <span>
            <LTTButton
              variant="outline"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              disabled={record.status === "cancelled"}
              onClick={() => handlePrint(record)}
            />
          </span>
        </Tooltip>
        <Tooltip title="Hoàn tiền">
          <span>
            <LTTButton
              variant="danger"
              size="sm"
              icon={<RefreshCcw className="w-3.5 h-3.5" />}
              disabled={record.status === "cancelled" || record.status === "checked_in"}
              onClick={() => handleRefund(record)}
            />
          </span>
        </Tooltip>
      </Space>
    ),
  },
];
