"use client";
import { ColumnsType } from "antd/es/table";

export interface CinemaDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<CinemaDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ten rap",
    width: 60,
    key: "name",
    dataIndex: "name",
  },
  {
    title: "Dia chi",
    width: 80,
    key: "address",
    dataIndex: "address",
  },
  {
    title: "Gio hoat dong",
    width: 40,
    key: "operatingHours",
    dataIndex: "operatingHours",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
];
