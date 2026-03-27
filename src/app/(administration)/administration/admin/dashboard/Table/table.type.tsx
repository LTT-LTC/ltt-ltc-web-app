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
    title: "Ten rap",
    width: 60,
    key: "cinemaName",
    dataIndex: "cinemaName",
  },
  {
    title: "Trang thai",
    width: 40,
    key: "status",
    dataIndex: "status",
  },
  {
    title: "So phong",
    width: 30,
    key: "roomCount",
    dataIndex: "roomCount",
  },
  {
    title: "Doanh thu",
    width: 50,
    key: "revenue",
    dataIndex: "revenue",
  },
];
