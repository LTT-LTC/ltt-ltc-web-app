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
    title: "Hotline",
    width: 40,
    key: "hotline",
    dataIndex: "hotline",
  },
  {
    title: "So phong",
    width: 30,
    key: "roomCount",
    dataIndex: "roomCount",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
];
