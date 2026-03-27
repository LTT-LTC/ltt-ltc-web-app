"use client";
import { ColumnsType } from "antd/es/table";

export interface DashboardDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<DashboardDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Chi so",
    width: 60,
    key: "metric",
    dataIndex: "metric",
  },
  {
    title: "Gia tri hien tai",
    width: 40,
    key: "currentValue",
    dataIndex: "currentValue",
  },
  {
    title: "Thay doi",
    width: 30,
    key: "change",
    dataIndex: "change",
  },
  {
    title: "Xu huong",
    width: 30,
    key: "trend",
    dataIndex: "trend",
  },
];
