"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
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
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
  Download,
  TrendingUp,
  Ticket,
  UtensilsCrossed,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/src/@core/utils/cn";
import { useRevenueMetrics } from "@/src/services/administration-service/booking/useRevenueMetrics";

const formatVND = (n: number) => (n / 1_000_000).toFixed(1) + "M";
const formatFull = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function RevenueReportsPage() {
  const today = dayjs();
  const [fromDate, setFromDate] = useState(today.subtract(30, "day").format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(today.format("YYYY-MM-DD"));
  const [cinemaFilter, setCinemaFilter] = useState("all");

  const metrics = useRevenueMetrics({
    fromDate: dayjs(fromDate).startOf("day").toISOString(),
    toDate: dayjs(toDate).endOf("day").toISOString(),
    cinemaId: cinemaFilter,
    todayDate: today.format("YYYY-MM-DD"),
  });

  const cards = useMemo(() => [
    {
      label: "Tổng doanh thu",
      value: formatFull(metrics.totals.totalRevenue),
      icon: DollarSign,
      color: "text-primary-shadcn",
      bgColor: "bg-red-50",
    },
    {
      label: "Doanh thu vé",
      value: formatFull(metrics.totals.ticketRevenue),
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Doanh thu F&B",
      value: formatFull(metrics.totals.fnbRevenue),
      icon: UtensilsCrossed,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Vé bán ra",
      value: metrics.totals.ticketsSold.toLocaleString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ], [metrics.totals]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Báo cáo doanh thu</h1>
        <div className="flex items-center gap-3">
          <LTTInput
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-40"
          />
          <span className="text-muted-foreground-shadcn">—</span>
          <LTTInput
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40"
          />
          <LTTSelect value={cinemaFilter} onValueChange={setCinemaFilter}>
            <LTTSelectTrigger className="w-56">
              <LTTSelectValue placeholder="Tất cả rạp" />
            </LTTSelectTrigger>
            <LTTSelectContent>
              <LTTSelectItem value="all">Tất cả rạp</LTTSelectItem>
              {metrics.cinemaOptions.map((c) => (
                <LTTSelectItem key={c.id} value={c.id}>
                  {c.name}
                </LTTSelectItem>
              ))}
            </LTTSelectContent>
          </LTTSelect>
          <LTTButton variant="outline" className="gap-2" onClick={metrics.reload}>
            <Download className="h-4 w-4" /> Tải lại
          </LTTButton>
        </div>
      </div>

      {metrics.loading && (
        <div className="flex items-center gap-2 text-muted-foreground-shadcn py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Đang tải dữ liệu…
        </div>
      )}

      {metrics.error && (
        <div className="flex items-center gap-2 text-red-600 py-8 justify-center">
          <AlertCircle className="h-5 w-5" /> {metrics.error}
        </div>
      )}

      {!metrics.loading && !metrics.error && (
        <>
          {metrics.capped && (
            <div className="text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-md">
              Dữ liệu bị giới hạn (quá nhiều giao dịch). Thu hẹp khoảng thời gian để xem toàn bộ.
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 my-4">
            {cards.map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-border-shadcn bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", c.bgColor)}>
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
          <div className="grid gap-6 lg:grid-cols-2 my-4">
            <div className="rounded-xl border border-border-shadcn bg-card p-5 shadow-sm">
              <h3 className="mb-6 font-heading text-base font-semibold border-b border-border-shadcn pb-2">
                Doanh thu theo ngày
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.dailyRows}>
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
                    formatter={(v: number) => formatFull(v)}
                    labelFormatter={(l) => `Ngày ${l}`}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="ticketRevenue" name="Vé" fill="#c92a2a" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="fnbRevenue" name="F&B" fill="#fab005" radius={[4, 4, 0, 0]} opacity={0.7} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-border-shadcn bg-card p-5 shadow-sm">
              <h3 className="mb-6 font-heading text-base font-semibold border-b border-border-shadcn pb-2">
                Doanh thu theo giờ (hôm nay)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.hourlyRows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="h" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#888" }} tickFormatter={formatVND} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(v: number) => formatFull(v)}
                    labelFormatter={(l) => `${l}:00`}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#c92a2a"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#c92a2a", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
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
                  </tr>
                </thead>
                <tbody>
                  {metrics.dailyRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground-shadcn">
                        Không có dữ liệu trong khoảng thời gian này.
                      </td>
                    </tr>
                  )}
                  {metrics.dailyRows.map((d) => (
                    <tr
                      key={d.date}
                      className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/20 transition-colors"
                    >
                      <td className="px-5 py-4 font-medium">{d.date}</td>
                      <td className="px-5 py-4 text-right">{formatFull(d.ticketRevenue)}</td>
                      <td className="px-5 py-4 text-right">{formatFull(d.fnbRevenue)}</td>
                      <td className="px-5 py-4 text-right font-bold text-primary-shadcn">{formatFull(d.totalRevenue)}</td>
                      <td className="px-5 py-4 text-right">{d.ticketsSold}</td>
                    </tr>
                  ))}
                  {metrics.dailyRows.length > 0 && (
                    <tr className="bg-muted-shadcn/50 font-bold border-t-2 border-border-shadcn">
                      <td className="px-5 py-5 text-base">Tổng cộng</td>
                      <td className="px-5 py-5 text-right text-base">{formatFull(metrics.totals.ticketRevenue)}</td>
                      <td className="px-5 py-5 text-right text-base">{formatFull(metrics.totals.fnbRevenue)}</td>
                      <td className="px-5 py-5 text-right text-lg text-primary-shadcn">{formatFull(metrics.totals.totalRevenue)}</td>
                      <td className="px-5 py-5 text-right text-base">{metrics.totals.ticketsSold}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
