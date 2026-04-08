"use client";

import { useState } from "react";
import Link from "next/link";
import { DownloadOutlined, DollarOutlined, TagOutlined, CoffeeOutlined, LineChartOutlined } from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { Table } from "antd";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";

import ReportFilter from "../Filter";
import { columns } from "../table.type";
import { mockRevenueData, mockAdminCinemas } from "../_mock/data";

const formatVND = (n: number) => (n / 1000000).toFixed(1) + "M";
const formatFull = (n: number) => n.toLocaleString("vi-VN") + "đ";

const ReportsContent = () => {
  const [cinemaFilter, setCinemaFilter] = useState("all");
  const data = mockRevenueData;

  const totalTicket = data.reduce((s, d) => s + d.ticketRevenue, 0);
  const totalFnb = data.reduce((s, d) => s + d.fnbRevenue, 0);
  const totalRevenue = data.reduce((s, d) => s + d.totalRevenue, 0);
  const totalTickets = data.reduce((s, d) => s + d.ticketsSold, 0);
  const avgOccupancy = Math.round(data.reduce((s, d) => s + d.occupancyRate, 0) / data.length);

  const cards = [
    { label: "Tổng doanh thu", value: formatFull(totalRevenue), icon: <DollarOutlined style={{ color: "#1677ff", fontSize: 20 }} /> },
    { label: "Doanh thu vé", value: formatFull(totalTicket), icon: <TagOutlined style={{ color: "#2563eb", fontSize: 20 }} /> },
    { label: "Doanh thu F&B", value: formatFull(totalFnb), icon: <CoffeeOutlined style={{ color: "#d97706", fontSize: 20 }} /> },
    { label: "Vé bán ra", value: totalTickets.toLocaleString(), icon: <LineChartOutlined style={{ color: "#16a34a", fontSize: 20 }} /> },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <ReportFilter
          cinema={cinemaFilter}
          onCinemaChange={setCinemaFilter}
          cinemas={mockAdminCinemas}
        />
        <LTTButton variant="primary" icon={<DownloadOutlined />}>
          Xuất báo cáo
        </LTTButton>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              {c.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-lg font-bold">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-4 text-sm font-semibold">Doanh thu theo ngày</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={formatVND} />
              <Tooltip formatter={(v: any) => formatFull(v as number)} labelFormatter={(l) => `Ngày ${l}`} />
              <Legend />
              <Bar dataKey="ticketRevenue" name="Vé" fill="#1677ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fnbRevenue" name="F&B" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-4 text-sm font-semibold">Tỷ lệ lấp đầy (%)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip formatter={(v: any) => `${v}%`} labelFormatter={(l) => `Ngày ${l}`} />
              <Line type="monotone" dataKey="occupancyRate" name="Tỷ lệ lấp đầy" stroke="#1677ff" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <LTTTable
          rowKey="date"
          columns={columns}
          dataSource={data}
          summary={() => (
            <Table.Summary.Row className="bg-gray-50 font-semibold">
              <Table.Summary.Cell index={0} className="px-4 py-3">Tổng cộng</Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right" className="px-4 py-3">{formatFull(totalTicket)}</Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right" className="px-4 py-3">{formatFull(totalFnb)}</Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right" className="px-4 py-3">{formatFull(totalRevenue)}</Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right" className="px-4 py-3">{totalTickets.toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right" className="px-4 py-3">{avgOccupancy}%</Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </div>
    </div>
  );
};

const ReportsListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quản lý rạp" },
          { title: <Link href="/administration/manager/reports">Báo cáo doanh thu</Link> },
        ]}
      />

      <LTTCard title="Báo cáo hệ thống" className="mt-4">
        <LTTTabs
          defaultActiveKey="1"
          items={[
            { key: "1", label: "Phòng vé & F&B", children: <ReportsContent /> },
            { key: "2", label: "Giao dịch", children: <div className="text-gray-500 p-4">Đang cập nhật...</div> },
          ]}
        />
      </LTTCard>
    </>
  );
};

export default ReportsListPage;
