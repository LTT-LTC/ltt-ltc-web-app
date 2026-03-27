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
    title: "Gia tri",
    width: 40,
    key: "value",
    dataIndex: "value",
  },
  {
    title: "Ghi chu",
    width: 60,
    key: "note",
    dataIndex: "note",
  },
];
