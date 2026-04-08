"use client";
import { ColumnsType } from "antd/es/table";

export interface ReportsDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<ReportsDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Rap",
    width: 60,
    key: "cinemaName",
    dataIndex: "cinemaName",
  },
  {
    title: "Doanh thu ve",
    width: 40,
    key: "ticketRevenue",
    dataIndex: "ticketRevenue",
  },
  {
    title: "Doanh thu FnB",
    width: 40,
    key: "fnbRevenue",
    dataIndex: "fnbRevenue",
  },
  {
    title: "Tong",
    width: 40,
    key: "totalRevenue",
    dataIndex: "totalRevenue",
  },
  {
    title: "So ve ban",
    width: 30,
    key: "ticketsSold",
    dataIndex: "ticketsSold",
  },
];
