"use client";
import { ColumnsType } from "antd/es/table";

export interface IncidentDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<IncidentDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Mo ta",
    width: 80,
    key: "description",
    dataIndex: "description",
  },
  {
    title: "Rap",
    width: 50,
    key: "cinemaName",
    dataIndex: "cinemaName",
  },
  {
    title: "Muc do",
    width: 30,
    key: "severity",
    dataIndex: "severity",
  },
  {
    title: "Suat chieu",
    width: 40,
    key: "showtime",
    dataIndex: "showtime",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
  {
    title: "Ngay",
    width: 40,
    key: "date",
    dataIndex: "date",
  },
];
