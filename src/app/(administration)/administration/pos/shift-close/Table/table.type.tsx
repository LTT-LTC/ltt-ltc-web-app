"use client";
import { ColumnsType } from "antd/es/table";

export interface ShiftCloseDataType {
  id: string;
  [key: string]: any;
}

export const columns = (): ColumnsType<ShiftCloseDataType> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    dataIndex: "id",
  },
  {
    title: "Ca",
    width: 40,
    key: "shiftName",
    dataIndex: "shiftName",
  },
  {
    title: "Tien mat",
    width: 30,
    key: "cashAmount",
    dataIndex: "cashAmount",
  },
  {
    title: "Quet the",
    width: 30,
    key: "cardAmount",
    dataIndex: "cardAmount",
  },
  {
    title: "Vi dien tu",
    width: 30,
    key: "ewalletAmount",
    dataIndex: "ewalletAmount",
  },
  {
    title: "Tong",
    width: 30,
    key: "total",
    dataIndex: "total",
  },
  {
    title: "Chenh lech",
    width: 30,
    key: "difference",
    dataIndex: "difference",
  },
];
