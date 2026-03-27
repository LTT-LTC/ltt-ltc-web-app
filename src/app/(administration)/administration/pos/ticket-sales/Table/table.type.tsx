"use client";
import { ColumnsType } from "antd/es/table";

export interface TicketSalesDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<TicketSalesDataType> => [
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
    title: "Suat chieu",
    width: 40,
    key: "showtime",
    dataIndex: "showtime",
  },
  {
    title: "Phong",
    width: 30,
    key: "room",
    dataIndex: "room",
  },
  {
    title: "Ghe con",
    width: 30,
    key: "availableSeats",
    dataIndex: "availableSeats",
  },
  {
    title: "Gia",
    width: 30,
    key: "price",
    dataIndex: "price",
  },
];
