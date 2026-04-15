import type { ColumnsType } from "antd/es/table";
import type { RevenueData } from "./_mock/data";

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export const columns: ColumnsType<RevenueData> = [
  {
    title: "Ngày",
    key: "date",
    dataIndex: "date",
  },
  {
    title: "Doanh thu vé",
    key: "ticketRevenue",
    dataIndex: "ticketRevenue",
    align: "right",
    render: (value: number) => formatCurrency(value),
  },
  {
    title: "Doanh thu F&B",
    key: "fnbRevenue",
    dataIndex: "fnbRevenue",
    align: "right",
    render: (value: number) => formatCurrency(value),
  },
  {
    title: "Tổng",
    key: "totalRevenue",
    dataIndex: "totalRevenue",
    align: "right",
    render: (value: number) => formatCurrency(value),
  },
  {
    title: "Vé bán",
    key: "ticketsSold",
    dataIndex: "ticketsSold",
    align: "right",
    render: (value: number) => value.toLocaleString("vi-VN"),
  },
  {
    title: "Lấp đầy",
    key: "occupancyRate",
    dataIndex: "occupancyRate",
    align: "right",
    render: (value: number) => `${value}%`,
  },
];
