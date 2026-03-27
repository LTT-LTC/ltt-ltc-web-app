"use client";
import { ColumnsType } from "antd/es/table";

export interface SettingsDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<SettingsDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ten cai dat",
    width: 60,
    key: "name",
    dataIndex: "name",
  },
  {
    title: "Gia tri",
    width: 60,
    key: "value",
    dataIndex: "value",
  },
  {
    title: "Mo ta",
    width: 80,
    key: "description",
    dataIndex: "description",
  },
  {
    title: "Lan cap nhat",
    width: 40,
    key: "lastUpdated",
    dataIndex: "lastUpdated",
  },
];
