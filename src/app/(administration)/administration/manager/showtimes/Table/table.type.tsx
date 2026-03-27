"use client";
import { ColumnsType } from "antd/es/table";

export interface ShowtimesDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<ShowtimesDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Phim",
    width: 60,
    key: "movieName",
    dataIndex: "movieName",
  },
  {
    title: "Phong",
    width: 30,
    key: "roomName",
    dataIndex: "roomName",
  },
  {
    title: "Gio bat dau",
    width: 30,
    key: "startTime",
    dataIndex: "startTime",
  },
  {
    title: "Gio ket thuc",
    width: 30,
    key: "endTime",
    dataIndex: "endTime",
  },
  {
    title: "Don rap",
    width: 30,
    key: "cleaningTime",
    dataIndex: "cleaningTime",
  },
  {
    title: "Lap day",
    width: 30,
    key: "occupancy",
    dataIndex: "occupancy",
  },
];
