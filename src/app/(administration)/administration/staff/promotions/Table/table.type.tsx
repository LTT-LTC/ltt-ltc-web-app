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
    title: "Ma",
    width: 30,
    key: "code",
    dataIndex: "code",
  },
  {
    title: "Gia tri",
    width: 30,
    key: "value",
    dataIndex: "value",
  },
  {
    title: "Bat dau",
    width: 40,
    key: "startDate",
    dataIndex: "startDate",
  },
  {
    title: "Het han",
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
