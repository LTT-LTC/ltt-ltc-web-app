"use client";
import { ColumnsType } from "antd/es/table";

export interface StaffDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<StaffDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ho va ten",
    width: 60,
    key: "name",
    dataIndex: "name",
  },
  {
    title: "Email",
    width: 50,
    key: "email",
    dataIndex: "email",
  },
  {
    title: "Ma",
    width: 30,
    key: "code",
    dataIndex: "code",
  },
  {
    title: "Vai tro",
    width: 40,
    key: "role",
    dataIndex: "role",
  },
  {
    title: "Chi nhanh",
    width: 40,
    key: "branch",
    dataIndex: "branch",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
];
