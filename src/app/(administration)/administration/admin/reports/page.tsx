"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  LTTSelect,
  LTTSelectContent,
  LTTSelectItem,
  LTTSelectTrigger,
  LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import {
  Download,
  TrendingUp,
  Ticket,
  UtensilsCrossed,
  DollarSign,
} from "lucide-react";
import {
  mockRevenueData,
  mockAdminCinemas,
} from "@/src/@core/const/mock/adminMockData";
import { cn } from "@/src/@core/utils/cn";

const formatVND = (n: number) => (n / 1000000).toFixed(1) + "M";
const formatFull = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function RevenueReportsPage() {
  const [cinemaFilter, setCinemaFilter] = useState("all");
  const data = mockRevenueData;

  const totalTicket = data.reduce((s, d) => s + d.ticketRevenue, 0);
  const totalFnb = data.reduce((s, d) => s + d.fnbRevenue, 0);
  const totalRevenue = data.reduce((s, d) => s + d.totalRevenue, 0);
  const totalTickets = data.reduce((s, d) => s + d.ticketsSold, 0);
  const avgOccupancy = Math.round(
    data.reduce((s, d) => s + d.occupancyRate, 0) / data.length
  );

  const cards = [
    {
      label: "Tổng doanh thu",
      value: formatFull(totalRevenue),
      icon: DollarSign,
      color: "text-primary-shadcn",
      bgColor: "bg-red-50",
    },
    {
      label: "Doanh thu vé",
      value: formatFull(totalTicket),
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Doanh thu F&B",
      value: formatFull(totalFnb),
      icon: UtensilsCrossed,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Vé bán ra",
      value: totalTickets.toLocaleString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Báo cáo doanh thu</h1>
        <div className="flex items-center gap-3">
          <LTTSelect value={cinemaFilter} onValueChange={setCinemaFilter}>
            <LTTSelectTrigger className="w-56">
              <LTTSelectValue placeholder="Tất cả rạp" />
            </LTTSelectTrigger>
            <LTTSelectContent>
              <LTTSelectItem value="all">Tất cả rạp</LTTSelectItem>
              {mockAdminCinemas.map((c) => (
                <LTTSelectItem key={c.id} value={c.id}>
                  {c.name}
                </LTTSelectItem>
              ))}
            </LTTSelectContent>
          </LTTSelect>
          <LTTButton variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Xuất báo cáo
          </LTTButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border-shadcn bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  c.bgColor
                )}
              >
                <c.icon className={cn("h-6 w-6", c.color)} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground-shadcn uppercase tracking-wider">
                  {c.label}
                </p>
                <p className="text-xl font-bold">{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border-shadcn bg-card p-5 shadow-sm">
          <h3 className="mb-6 font-heading text-base font-semibold border-b border-border-shadcn pb-2">
            Doanh thu theo ngày
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#888" }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#888" }}
                tickFormatter={formatVND}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(v: any) => formatFull(v as number)}
                labelFormatter={(l) => `Ngày ${l}`}
              />
              <Legend iconType="circle" />
              <Bar
                dataKey="ticketRevenue"
                name="Vé"
                fill="#c92a2a"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
              <Bar
                dataKey="fnbRevenue"
                name="F&B"
                fill="#fab005"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border-shadcn bg-card p-5 shadow-sm">
          <h3 className="mb-6 font-heading text-base font-semibold border-b border-border-shadcn pb-2">
            Tỷ lệ lấp đầy (%)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#888" }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#888" }}
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(v: any) => `${v}%`}
                labelFormatter={(l) => `Ngày ${l}`}
              />
              <Line
                type="monotone"
                dataKey="occupancyRate"
                name="Tỷ lệ lấp đầy"
                stroke="#c92a2a"
                strokeWidth={3}
                dot={{ r: 5, fill: "#c92a2a", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border-shadcn bg-card overflow-hidden shadow-sm">
        <div className="bg-muted-shadcn/30 px-5 py-3 border-b border-border-shadcn">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground-shadcn">
            Bảng kê chi tiết
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                <th className="px-5 py-4 text-left font-semibold">Ngày</th>
                <th className="px-5 py-4 text-right font-semibold">Doanh thu vé</th>
                <th className="px-5 py-4 text-right font-semibold">Doanh thu F&B</th>
                <th className="px-5 py-4 text-right font-semibold">Tổng cộng</th>
                <th className="px-5 py-4 text-right font-semibold">Vé bán</th>
                <th className="px-5 py-4 text-right font-semibold">Lấp đầy</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr
                  key={d.date}
                  className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/20 transition-colors"
                >
                  <td className="px-5 py-4 font-medium">{d.date}</td>
                  <td className="px-5 py-4 text-right">{formatFull(d.ticketRevenue)}</td>
                  <td className="px-5 py-4 text-right">{formatFull(d.fnbRevenue)}</td>
                  <td className="px-5 py-4 text-right font-bold text-primary-shadcn">
                    {formatFull(d.totalRevenue)}
                  </td>
                  <td className="px-5 py-4 text-right">{d.ticketsSold}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                      {d.occupancyRate}%
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-muted-shadcn/50 font-bold border-t-2 border-border-shadcn">
                <td className="px-5 py-5 text-base">Tổng cộng</td>
                <td className="px-5 py-5 text-right text-base">
                  {formatFull(totalTicket)}
                </td>
                <td className="px-5 py-5 text-right text-base">
                  {formatFull(totalFnb)}
                </td>
                <td className="px-5 py-5 text-right text-lg text-primary-shadcn">
                  {formatFull(totalRevenue)}
                </td>
                <td className="px-5 py-5 text-right text-base">{totalTickets}</td>
                <td className="px-5 py-5 text-right text-base">{avgOccupancy}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
