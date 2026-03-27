"use client";
import { ColumnsType } from "antd/es/table";

export interface MoviesDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<MoviesDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ten phim",
    width: 80,
    key: "name",
    dataIndex: "name",
  },
  {
    title: "The loai",
    width: 40,
    key: "genre",
    dataIndex: "genre",
  },
  {
    title: "Thoi luong",
    width: 30,
    key: "duration",
    dataIndex: "duration",
  },
  {
    title: "Do tuoi",
    width: 30,
    key: "ageRating",
    dataIndex: "ageRating",
  },
  {
    title: "Dinh dang",
    width: 30,
    key: "format",
    dataIndex: "format",
  },
  {
    title: "Trang thai",
    width: 30,
    key: "status",
    dataIndex: "status",
  },
];
