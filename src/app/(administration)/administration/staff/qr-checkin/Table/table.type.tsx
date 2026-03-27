"use client";
import { ColumnsType } from "antd/es/table";

export interface QrCheckinDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<QrCheckinDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ma ve",
    width: 40,
    key: "ticketCode",
    dataIndex: "ticketCode",
  },
  {
    title: "Khach hang",
    width: 50,
    key: "customerName",
    dataIndex: "customerName",
  },
  {
    title: "Phim",
    width: 50,
    key: "movieName",
    dataIndex: "movieName",
  },
  {
    title: "Suat chieu",
    width: 40,
    key: "showtime",
    dataIndex: "showtime",
  },
  {
    title: "Ghe",
    width: 30,
    key: "seat",
    dataIndex: "seat",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
];
