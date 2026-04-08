"use client";
import { ColumnsType } from "antd/es/table";

export interface SeatmapDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<SeatmapDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ten phong",
    width: 60,
    key: "roomName",
    dataIndex: "roomName",
  },
  {
    title: "Rap",
    width: 50,
    key: "cinemaName",
    dataIndex: "cinemaName",
  },
  {
    title: "So hang",
    width: 20,
    key: "rows",
    dataIndex: "rows",
  },
  {
    title: "So cot",
    width: 20,
    key: "cols",
    dataIndex: "cols",
  },
  {
    title: "Tong ghe",
    width: 30,
    key: "totalSeats",
    dataIndex: "totalSeats",
  },
  {
    title: "Ghe hong",
    width: 30,
    key: "brokenSeats",
    dataIndex: "brokenSeats",
  },
];
