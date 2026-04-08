"use client";
import { ColumnsType } from "antd/es/table";

export interface PromotionsDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<PromotionsDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ten",
    width: 60,
    key: "name",
    dataIndex: "name",
  },
  {
    title: "Loai",
    width: 30,
    key: "type",
    dataIndex: "type",
  },
  {
    title: "Gia tri",
    width: 30,
    key: "value",
    dataIndex: "value",
  },
  {
    title: "Ngay bat dau",
    width: 40,
    key: "startDate",
    dataIndex: "startDate",
  },
  {
    title: "Ngay ket thuc",
    width: 40,
    key: "endDate",
    dataIndex: "endDate",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
];
