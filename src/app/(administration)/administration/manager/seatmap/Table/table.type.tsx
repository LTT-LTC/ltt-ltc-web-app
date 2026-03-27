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
    title: "Phong",
    width: 60,
    key: "roomName",
    dataIndex: "roomName",
  },
  {
    title: "Kich co",
    width: 30,
    key: "dimension",
    dataIndex: "dimension",
  },
  {
    title: "Ghe thuong",
    width: 30,
    key: "standardSeats",
    dataIndex: "standardSeats",
  },
  {
    title: "Ghe VIP",
    width: 30,
    key: "vipSeats",
    dataIndex: "vipSeats",
  },
  {
    title: "Sweetbox",
    width: 30,
    key: "sweetboxSeats",
    dataIndex: "sweetboxSeats",
  },
  {
    title: "Ghe khoa",
    width: 30,
    key: "blockedSeats",
    dataIndex: "blockedSeats",
  },
];
