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
    title: "Khach hang",
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
    title: "Loai",
    width: 30,
    key: "type",
    dataIndex: "type",
  },
  {
    title: "Noi dung",
    width: 60,
    key: "content",
    dataIndex: "content",
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
