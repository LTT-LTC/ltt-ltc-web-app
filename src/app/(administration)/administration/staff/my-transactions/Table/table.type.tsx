"use client";
import { ColumnsType } from "antd/es/table";

export interface MyTransactionsDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<MyTransactionsDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ma giao dich",
    width: 40,
    key: "transactionCode",
    dataIndex: "transactionCode",
  },
  {
    title: "Loai",
    width: 30,
    key: "type",
    dataIndex: "type",
  },
  {
    title: "So tien",
    width: 30,
    key: "amount",
    dataIndex: "amount",
  },
  {
    title: "Phuong thuc",
    width: 30,
    key: "method",
    dataIndex: "method",
  },
  {
    title: "Thoi gian",
    width: 40,
    key: "time",
    dataIndex: "time",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
];
