"use client";
import { ColumnsType } from "antd/es/table";

export interface TenantsDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<TenantsDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ten tenant",
    width: 60,
    key: "name",
    dataIndex: "name",
  },
  {
    title: "Ma",
    width: 40,
    key: "code",
    dataIndex: "code",
  },
  {
    title: "Email",
    width: 50,
    key: "email",
    dataIndex: "email",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
  {
    title: "Ngay tao",
    width: 40,
    key: "createdDate",
    dataIndex: "createdDate",
  },
];
