'use client';
import { get } from "@/src/@core/utils/get";
import { EmployeeOutputDto } from "@/src/services/administration-service/employee/models/output.model";
import { ColumnsType } from "antd/es/table";
import Link from "next/link";

export const columns = (page: number, fetch: number): ColumnsType<EmployeeOutputDto> => [
  {
    title: "STT",
    width: 20,
    key: "id",
    ellipsis: true,
    render: (value, record, index) => get.tableId(page, fetch, index),
  },
  {
    title: "Họ và tên",
    width: 50,
    key: "name",
    dataIndex: "name",
    render: (value, record, index) => <Link href={`/employee/${record.id}`}>{value}</Link>,
  },
  {
    title: "Email",
    width: 50,
    key: "email",
    dataIndex: "email",
  },
  {
    title: "Mã nhân sự",
    width: 50,
    key: "code",
    dataIndex: "code",
  },
  {
    title: "Vai trò",
    width: 50,
    key: "position",
    dataIndex: "position",
    render: (value, record, index) => <></>,
  },
  {
    title: "Phòng ban",
    width: 50,
    key: "department",
    dataIndex: "department",
    render: (value, record, index) => <></>,
  },
];
