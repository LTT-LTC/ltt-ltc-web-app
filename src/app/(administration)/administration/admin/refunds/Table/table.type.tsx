"use client";
import { ColumnsType } from "antd/es/table";

export interface RefundsDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<RefundsDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ma hoan tra",
    width: 40,
    key: "code",
    dataIndex: "code",
  },
  {
    title: "Khach hang",
    width: 50,
    key: "customerName",
    dataIndex: "customerName",
  },
  {
    title: "So tien",
    width: 30,
    key: "amount",
    dataIndex: "amount",
  },
  {
    title: "Ly do",
    width: 60,
    key: "reason",
    dataIndex: "reason",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
  {
    title: "Ngay",
    width: 40,
    key: "date",
    dataIndex: "date",
  },
];
