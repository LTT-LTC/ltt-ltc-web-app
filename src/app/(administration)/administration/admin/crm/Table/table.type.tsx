"use client";
import { ColumnsType } from "antd/es/table";

export interface CrmDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<CrmDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ten khach hang",
    width: 60,
    key: "customerName",
    dataIndex: "customerName",
  },
  {
    title: "SDT",
    width: 40,
    key: "phone",
    dataIndex: "phone",
  },
  {
    title: "Email",
    width: 50,
    key: "email",
    dataIndex: "email",
  },
  {
    title: "So giao dich",
    width: 30,
    key: "transactionCount",
    dataIndex: "transactionCount",
  },
  {
    title: "Thanh vien",
    width: 30,
    key: "membership",
    dataIndex: "membership",
  },
];
