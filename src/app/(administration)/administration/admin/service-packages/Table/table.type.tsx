"use client";
import { ColumnsType } from "antd/es/table";

export interface ServicePackagesDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<ServicePackagesDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ten goi",
    width: 60,
    key: "name",
    dataIndex: "name",
  },
  {
    title: "Mo ta",
    width: 80,
    key: "description",
    dataIndex: "description",
  },
  {
    title: "Gia",
    width: 40,
    key: "price",
    dataIndex: "price",
  },
  {
    title: "Thoi han",
    width: 30,
    key: "duration",
    dataIndex: "duration",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
];
