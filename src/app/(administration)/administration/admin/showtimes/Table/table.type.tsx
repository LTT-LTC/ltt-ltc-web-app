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
    title: "Rap",
    width: 50,
    key: "cinemaName",
    dataIndex: "cinemaName",
  },
  {
    title: "Phong",
    width: 30,
    key: "roomName",
    dataIndex: "roomName",
  },
  {
    title: "Gio chieu",
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
    title: "Ti le lap day",
    width: 30,
    key: "occupancy",
    dataIndex: "occupancy",
  },
];
