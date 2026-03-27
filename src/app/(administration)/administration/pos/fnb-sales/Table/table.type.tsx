"use client";
import { ColumnsType } from "antd/es/table";

export interface FnbSalesDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<FnbSalesDataType> => [
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
    title: "Danh muc",
    width: 40,
    key: "category",
    dataIndex: "category",
  },
  {
    title: "Gia",
    width: 30,
    key: "price",
    dataIndex: "price",
  },
  {
    title: "Ton kho",
    width: 30,
    key: "stock",
    dataIndex: "stock",
  },
];
