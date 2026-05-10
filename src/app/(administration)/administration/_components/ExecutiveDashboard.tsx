"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/src/@core/utils/cn";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import {
  LTTDialog,
  LTTDialogContent,
  LTTDialogFooter,
  LTTDialogHeader,
  LTTDialogTitle,
  LTTDialogTrigger,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import {
  LTTSelect,
  LTTSelectContent,
  LTTSelectItem,
  LTTSelectTrigger,
  LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { useRevenueMetrics } from "@/src/services/administration-service/booking/useRevenueMetrics";
import { cinemaService, type CinemaOutputDto } from "@/src/services/administration-service/cinema/cinema.service";
import { useDashboardData } from "@/src/services/administration-service/dashboard/useDashboardData";

type Tone = "good" | "warn" | "danger" | "info" | "neutral" | "draft";
type DashboardRole = "admin" | "manager";

type KpiItem = {
  labelKey: string;
  value: string;
  deltaKey: string;
  deltaTone: Tone;
  subKey: string;
  subTone: Tone;
};

type WorkflowLink = {
  key: string;
  href: string;
  count: string;
  tone: Tone;
};

// KPI values are now computed live from payment data via useRevenueMetrics.

// Revenue trend and hourly data are now fetched live via useRevenueMetrics.

const ADMIN_HALLS = [
  { name: "Hall 1 · Inception 2", pct: 91 },
  { name: "Hall 2 · The Wild Robot 2", pct: 87 },
  { name: "Hall 3 · Venom 3", pct: 74 },
  { name: "Hall 4 · Paddington 4", pct: 68 },
  { name: "Hall 5 · Quiet Place 3", pct: 38 },
  { name: "Hall 6 · Archive (limited)", pct: 21 },
];

// Top movies data is now fetched live via useRevenueMetrics.

const ADMIN_MEMBER_TIERS = [
  { name: "Gold", pct: 18, color: "bg-amber-500" },
  { name: "Silver", pct: 32, color: "bg-zinc-500" },
  { name: "Standard", pct: 50, color: "bg-blue-500" },
];

const ADMIN_PROMOTIONS = [
  { name: "Weekday combo deal", badge: "↑ 34% redemption", tone: "good" as Tone },
  { name: "Gold member -20%", badge: "↑ 22% redemption", tone: "good" as Tone },
  { name: "Student Friday", badge: "Expires in 2 days", tone: "warn" as Tone },
];

const ADMIN_OPS_SNAPSHOT = [
  { label: "Staff on duty now", value: "24 / 27 scheduled", tone: "neutral" as Tone },
  { label: "Shift coverage gap", value: "3 unconfirmed Projection team", tone: "warn" as Tone },
  { label: "Next screening starts", value: "in 18 min (Hall 2)", tone: "neutral" as Tone },
  { label: "Concession wait time", value: "~3 min avg", tone: "good" as Tone },
  { label: "RBAC audit flag", value: "None today", tone: "good" as Tone },
  { label: "System uptime", value: "99.98% — 30 days", tone: "good" as Tone },
];

const MANAGER_FNB_TOP = [
  { name: "Combo L (popcorn+drink)", sold: 312 },
  { name: "Nachos set", sold: 148 },
  { name: "Hotdog", sold: 91 },
];


const ADMIN_WORKFLOW_LINKS: WorkflowLink[] = [
  { key: "refund_requests", href: "/administration/admin/refunds", count: "312", tone: "warn" },
  { key: "booking_monitoring", href: "/administration/admin/bookings", count: "24", tone: "info" },
];

const MANAGER_WORKFLOW_LINKS: WorkflowLink[] = [
  { key: "refund_requests", href: "/administration/manager/refunds", count: "27", tone: "warn" },
  { key: "booking_monitoring", href: "/administration/manager/bookings", count: "11", tone: "info" },
];

const toneTextClass = (tone: Tone): string =>
  ({
    good: "text-emerald-600",
    warn: "text-amber-600",
    danger: "text-red-600",
    info: "text-blue-600",
    neutral: "text-muted-foreground-shadcn",
    draft: "text-violet-600",
  })[tone];

const toneBgClass = (tone: Tone): string =>
  ({
    good: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-muted-shadcn text-muted-foreground-shadcn",
    draft: "bg-violet-100 text-violet-700",
  })[tone];

const deltaIconByTone: Partial<Record<Tone, LucideIcon>> = {
  good: TrendingUp,
  warn: TrendingDown,
};

const occupancyBarColor = (pct: number): string =>
  pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";

const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

interface RangeFilterProps {
  value: string;
  onChange: (range: string, customFrom?: string, customTo?: string) => void;
}

function RangeFilter({ value, onChange }: RangeFilterProps) {
  const { t } = useLocalization();
  const [customOpen, setCustomOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="flex items-center gap-2">
      <LTTSelect
        value={value}
        onValueChange={(v) => {
          if (v === "custom") {
            setCustomOpen(true);
          } else {
            onChange(v);
          }
        }}
      >
        <LTTSelectTrigger className="w-52">
          <LTTSelectValue />
        </LTTSelectTrigger>
        <LTTSelectContent>
          <LTTSelectItem value="today">{t("admin.executive_dashboard.filters.today")}</LTTSelectItem>
          <LTTSelectItem value="7d">{t("admin.executive_dashboard.filters.last_7_days")}</LTTSelectItem>
          <LTTSelectItem value="30d">{t("admin.executive_dashboard.filters.last_30_days")}</LTTSelectItem>
          <LTTSelectItem value="month">{t("admin.executive_dashboard.filters.this_month")}</LTTSelectItem>
          <LTTSelectItem value="custom">{t("admin.executive_dashboard.filters.custom_range")}</LTTSelectItem>
        </LTTSelectContent>
      </LTTSelect>

      <LTTDialog open={customOpen} onOpenChange={setCustomOpen}>
        <LTTDialogTrigger asChild>
          <LTTButton variant="outline" size="icon" title={t("admin.executive_dashboard.filters.custom_range_tooltip")}>
            <Calendar className="h-4 w-4" />
          </LTTButton>
        </LTTDialogTrigger>
        <LTTDialogContent>
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.executive_dashboard.filters.custom_range_title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid grid-cols-1 gap-3 py-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <LTTLabel htmlFor="fromDate">{t("admin.executive_dashboard.filters.from_date")}</LTTLabel>
              <LTTInput id="fromDate" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <LTTLabel htmlFor="toDate">{t("admin.executive_dashboard.filters.to_date")}</LTTLabel>
              <LTTInput id="toDate" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setCustomOpen(false)}>
              {t("admin.executive_dashboard.filters.cancel")}
            </LTTButton>
            <LTTButton
              onClick={() => {
                onChange("custom", fromDate, toDate);
                setCustomOpen(false);
              }}
              disabled={!fromDate || !toDate}
            >
              {t("admin.executive_dashboard.filters.apply")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}

function KpiStrip({ items }: { items: KpiItem[] }) {
  const { t } = useLocalization();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const DeltaIcon = deltaIconByTone[item.deltaTone];

        return (
          <div key={item.labelKey} className="rounded-xl border border-border-shadcn bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground-shadcn">
              {t(`admin.executive_dashboard.kpis.${item.labelKey}`)}
            </p>
            <p className="mt-1.5 text-3xl font-bold">{item.value}</p>
            <div className={cn("mt-2 flex items-center gap-1 text-xs", toneTextClass(item.deltaTone))}>
              {DeltaIcon ? <DeltaIcon className="h-3 w-3" /> : null}
              <span>{t(`admin.executive_dashboard.kpis.${item.deltaKey}`)}</span>
            </div>
            <span className={cn("mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-medium", toneBgClass(item.subTone))}>
              {t(`admin.executive_dashboard.kpis.${item.subKey}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function WorkflowRequestPanel({ role }: { role: DashboardRole }) {
  const { t } = useLocalization();
  const links = role === "admin" ? ADMIN_WORKFLOW_LINKS : MANAGER_WORKFLOW_LINKS;

  return (
    <div className="rounded-xl border border-border-shadcn bg-card p-4">
      <h3 className="mb-3 font-heading text-sm font-semibold">{t("admin.executive_dashboard.workflow.title")}</h3>
      <div className="space-y-2">
        {links.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="flex items-center justify-between rounded-md border border-border-shadcn p-3 transition-colors hover:bg-muted-shadcn/40 my-4"
          >
            <div>
              <p className="text-sm font-medium">{t(`admin.executive_dashboard.workflow.${item.key}`)}</p>
              <p className={cn("text-xs", toneTextClass(item.tone))}>
                {t("admin.executive_dashboard.workflow.pending_count", { count: item.count })}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground-shadcn" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function DisabledSection({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div className="relative opacity-50 pointer-events-none select-none">
      {children}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[1px]">
        <span className="rounded-md bg-muted-shadcn px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground-shadcn">
          {title ?? "Coming soon"}
        </span>
      </div>
    </div>
  );
}

function computeDateRange(range: string, customFrom?: string, customTo?: string) {
  const now = dayjs();
  switch (range) {
    case "today":
      return { from: now.startOf("day").toISOString(), to: now.endOf("day").toISOString() };
    case "7d":
      return { from: now.subtract(7, "day").startOf("day").toISOString(), to: now.endOf("day").toISOString() };
    case "30d":
      return { from: now.subtract(30, "day").startOf("day").toISOString(), to: now.endOf("day").toISOString() };
    case "month":
      return { from: now.startOf("month").toISOString(), to: now.endOf("day").toISOString() };
    case "custom":
      return {
        from: customFrom ? dayjs(customFrom).startOf("day").toISOString() : now.subtract(7, "day").startOf("day").toISOString(),
        to: customTo ? dayjs(customTo).endOf("day").toISOString() : now.endOf("day").toISOString(),
      };
    default:
      return { from: now.subtract(7, "day").startOf("day").toISOString(), to: now.endOf("day").toISOString() };
  }
}

export function ExecutiveDashboard({ role }: { role: DashboardRole }) {
  const { t } = useLocalization();
  const titleKey = role === "admin" ? "admin_title" : "manager_title";
  const subtitleKey = role === "admin" ? "admin_subtitle" : "manager_subtitle";
  const ticketLegend = useMemo(() => t("admin.executive_dashboard.charts.ticket_legend"), [t]);
  const fnbLegend = useMemo(() => t("admin.executive_dashboard.charts.fnb_legend"), [t]);
  const todayLegend = useMemo(() => t("admin.executive_dashboard.charts.today"), [t]);

  const today = dayjs();
  const [range, setRange] = useState("7d");
  const [customFrom, setCustomFrom] = useState<string | undefined>();
  const [customTo, setCustomTo] = useState<string | undefined>();
  const [selectedCinemaId, setSelectedCinemaId] = useState("all");
  const [cinemas, setCinemas] = useState<CinemaOutputDto[]>([]);

  useEffect(() => {
    cinemaService.getCinemaListAsync({ page: 1, fetch: 100 }).then((res) => {
      setCinemas(res.items ?? []);
    }).catch(() => {});
  }, []);

  const dateRange = useMemo(() => computeDateRange(range, customFrom, customTo), [range, customFrom, customTo]);

  const metrics = useRevenueMetrics({
    fromDate: dateRange.from,
    toDate: dateRange.to,
    cinemaId: selectedCinemaId !== "all" ? selectedCinemaId : undefined,
    todayDate: today.format("YYYY-MM-DD"),
  });

  const dashboard = useDashboardData({
    fromDate: dateRange.from,
    toDate: dateRange.to,
    cinemaId: selectedCinemaId !== "all" ? selectedCinemaId : undefined,
  });

  const isLoading = metrics.loading || dashboard.loading;

  const handleRefresh = () => {
    metrics.reload();
    dashboard.reload();
  };

  const handleRangeChange = (newRange: string, from?: string, to?: string) => {
    setRange(newRange);
    if (newRange === "custom") {
      setCustomFrom(from);
      setCustomTo(to);
    }
  };

  const liveKpis = useMemo<KpiItem[]>(() => {
    const fmt = (n: number) => n >= 1_000_000 ? `₫${(n / 1_000_000).toFixed(1)}M` : `₫${Math.round(n / 1000)}K`;
    const totals = dashboard.summary?.totals ?? metrics.totals;
    const occupancyRate = dashboard.hallOccupancy?.averageOccupancyRate;

    return [
      { labelKey: "revenue_today", value: isLoading ? "…" : fmt(totals.totalRevenue), deltaKey: "revenue_today_delta", deltaTone: "good", subKey: "revenue_today_sub", subTone: "good" },
      { labelKey: "tickets_sold_today", value: isLoading ? "…" : totals.ticketsSold.toLocaleString(), deltaKey: "tickets_sold_today_delta", deltaTone: "good", subKey: "tickets_sold_today_sub", subTone: "good" },
      { labelKey: "avg_occupancy_rate", value: isLoading ? "…" : occupancyRate != null ? `${occupancyRate}%` : "—", deltaKey: "avg_occupancy_rate_delta", deltaTone: occupancyRate != null && occupancyRate >= 60 ? "good" : "neutral", subKey: "avg_occupancy_rate_sub", subTone: occupancyRate != null && occupancyRate >= 60 ? "good" : "neutral" },
    ];
  }, [isLoading, metrics.totals, dashboard.summary, dashboard.hallOccupancy]);

  const chartData = useMemo(() => {
    const rows = dashboard.summary?.dailyBreakdown ?? metrics.dailyRows;
    return rows.map((r) => ({
      day: r.date.slice(5),
      tickets: Math.round(r.ticketRevenue / 1_000_000 * 10) / 10,
      fnb: Math.round(r.fnbRevenue / 1_000_000 * 10) / 10,
    }));
  }, [dashboard.summary, metrics.dailyRows]);

  const hourlyData = useMemo(() => {
    if (dashboard.summary?.hourlyTrend) {
      return dashboard.summary.hourlyTrend.map((r) => ({
        h: r.hour,
        today: Math.round(r.revenue / 1_000_000 * 10) / 10 || null,
      }));
    }
    return metrics.hourlyRows.map((r) => ({
      h: r.h,
      today: Math.round(r.revenue / 1_000_000 * 10) / 10 || null,
    }));
  }, [dashboard.summary, metrics.hourlyRows]);

  const formatCurrencyMillions = (value: unknown) => {
    const raw = Array.isArray(value) ? value[0] : value;
    return raw == null ? "—" : `₫${raw}M`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t(`admin.executive_dashboard.${titleKey}`)}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground-shadcn">{t(`admin.executive_dashboard.${subtitleKey}`)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RangeFilter value={range} onChange={handleRangeChange} />
          <LTTButton
            variant="outline"
            size="icon"
            title={t("admin.executive_dashboard.filters.refresh")}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </LTTButton>
          <LTTSelect value={selectedCinemaId} onValueChange={setSelectedCinemaId}>
            <LTTSelectTrigger className="w-48">
              <Building2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground-shadcn" />
              <LTTSelectValue placeholder={t("admin.executive_dashboard.filters.all_cinemas")} />
            </LTTSelectTrigger>
            <LTTSelectContent>
              <LTTSelectItem value="all">{t("admin.executive_dashboard.filters.all_cinemas")}</LTTSelectItem>
              {cinemas.map((c) => (
                <LTTSelectItem key={c.id} value={c.id}>{c.name}</LTTSelectItem>
              ))}
            </LTTSelectContent>
          </LTTSelect>
          <LTTButton variant="outline" className="gap-2" onClick={handleRefresh}>
            <Download className="h-4 w-4" />
            {t("admin.executive_dashboard.export_report")}
          </LTTButton>
        </div>
      </div>

      <KpiStrip items={liveKpis} />

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground-shadcn">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading revenue data…
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border-shadcn bg-card p-4 my-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold">{t("admin.executive_dashboard.charts.revenue_breakdown_title")}</h3>
            <span className="text-[11px] text-muted-foreground-shadcn">{t("admin.executive_dashboard.charts.revenue_breakdown_subtitle")}</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₫${value}M`} />
              <Tooltip formatter={formatCurrencyMillions} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="tickets" stackId="a" name={ticketLegend} fill="hsl(217 91% 60%)" />
              <Bar dataKey="fnb" stackId="a" name={fnbLegend} fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border-shadcn bg-card p-4 my-4">
          <h3 className="mb-3 font-heading text-sm font-semibold">{t("admin.executive_dashboard.charts.hourly_revenue_title")}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="h" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₫${value}M`} />
              <Tooltip formatter={formatCurrencyMillions} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="today" name={todayLegend} stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue detail table */}
      {!isLoading && (dashboard.summary?.dailyBreakdown ?? metrics.dailyRows).length > 0 && (
        <div className="rounded-xl border border-border-shadcn bg-card overflow-hidden shadow-sm">
          <div className="bg-muted-shadcn/30 px-5 py-3 border-b border-border-shadcn">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground-shadcn">
              Revenue detail
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Ticket</th>
                  <th className="px-4 py-3 text-right font-semibold">F&B</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard.summary?.dailyBreakdown ?? metrics.dailyRows).map((r) => (
                  <tr key={r.date} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.date}</td>
                    <td className="px-4 py-3 text-right">{formatVnd(r.ticketRevenue)}</td>
                    <td className="px-4 py-3 text-right">{formatVnd(r.fnbRevenue)}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-shadcn">{formatVnd(r.totalRevenue)}</td>
                    <td className="px-4 py-3 text-right">{r.ticketsSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {role === "admin" ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Hall occupancy — screenings</h3>
              <div className="space-y-3">
                {dashboard.hallOccupancy?.halls && dashboard.hallOccupancy.halls.length > 0 ? (
                  dashboard.hallOccupancy.halls.map((hall) => (
                    <div key={`${hall.screenId}-${hall.startTime}`}>
                      <div className="mb-1 flex items-center justify-between text-sm my-4">
                        <span className="text-foreground/90">{hall.screenName} · {hall.movieTitle}</span>
                        <span className={cn("font-semibold", toneTextClass(hall.occupancyPercent >= 80 ? "good" : hall.occupancyPercent >= 60 ? "info" : hall.occupancyPercent >= 40 ? "warn" : "danger"))}>
                          {hall.occupancyPercent}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-shadcn">
                        <div className={cn("h-full rounded-full", occupancyBarColor(hall.occupancyPercent))} style={{ width: `${hall.occupancyPercent}%` }} />
                      </div>
                    </div>
                  ))
                ) : !isLoading ? (
                  <p className="text-xs text-muted-foreground-shadcn py-4">No showtime data available</p>
                ) : null}
              </div>
            </div>

            <DisabledSection title="Coming soon">
              <WorkflowRequestPanel role={role} />
            </DisabledSection>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 my-4">
            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Top movies by revenue</h3>
              <div className="divide-y divide-border-shadcn">
                {(() => {
                  const movies = dashboard.summary?.topMovies ?? metrics.topMovies;
                  if (movies.length === 0 && !isLoading) {
                    return <p className="text-xs text-muted-foreground-shadcn py-4">No data available</p>;
                  }
                  return movies.map((movie) => (
                    <div key={movie.movieTitle || movie.showtimeId} className="flex items-center justify-between py-2.5">
                      <span className="text-sm">{movie.movieTitle}</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold">₫{(movie.revenue / 1_000_000).toFixed(1)}M</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <DisabledSection title="Coming soon">
              <div className="rounded-xl border border-border-shadcn bg-card p-4">
                <h3 className="mb-3 font-heading text-sm font-semibold">Member transactions</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between my-4">
                    <span className="text-muted-foreground-shadcn">New sign-ups today</span>
                    <span className="font-semibold">—</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-shadcn pt-2.5 my-4">
                    <span className="text-muted-foreground-shadcn">Pending card requests</span>
                    <span className="font-semibold">—</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-shadcn pt-2.5 my-4">
                    <span className="text-muted-foreground-shadcn">Points redeemed today</span>
                    <span className="font-semibold">—</span>
                  </div>
                </div>
              </div>
            </DisabledSection>

            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Promotions & gift cards</h3>
              <p className="mb-2 text-xs text-muted-foreground-shadcn">Active promotions</p>
              <div className="space-y-2">
                {(dashboard.promotionSummary?.activePromotions ?? ADMIN_PROMOTIONS).map((promotion) => (
                  <div key={promotion.name} className="flex items-center justify-between gap-2 my-4">
                    <span className="text-sm">{promotion.name}</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", toneBgClass("status" in promotion && (promotion as { status: string }).status === "Active" ? "good" : (promotion as { tone?: Tone }).tone ?? "info"))}>
                      {promotion.badge}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-border-shadcn pt-3">
                <p className="mb-2 text-xs text-muted-foreground-shadcn">Gift card summary</p>
                <div className="flex items-center justify-between text-sm my-4">
                  <span className="text-muted-foreground-shadcn">Active gift codes</span>
                  <span className="font-semibold">{dashboard.promotionSummary?.giftCardSummary?.activeGiftCards ?? "—"}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm my-4">
                  <span className="text-muted-foreground-shadcn">Outstanding balance</span>
                  <span className="font-semibold">{dashboard.promotionSummary?.giftCardSummary ? formatVnd(dashboard.promotionSummary.giftCardSummary.outstandingBalance) : "—"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DisabledSection title="Coming soon">
              <div className="rounded-xl border border-border-shadcn bg-card p-4">
                <h3 className="mb-3 font-heading text-sm font-semibold">{t("admin.executive_dashboard.alerts.title")}</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 rounded-md border border-border-shadcn p-3 my-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium">Operational alerts</p>
                      <p className="text-xs text-muted-foreground-shadcn">No data source connected yet</p>
                    </div>
                  </div>
                </div>
              </div>
            </DisabledSection>

            <DisabledSection title="Coming soon">
              <div className="rounded-xl border border-border-shadcn bg-card p-4">
                <h3 className="mb-3 font-heading text-sm font-semibold">Staff & operations snapshot</h3>
                <div className="divide-y divide-border-shadcn">
                  {ADMIN_OPS_SNAPSHOT.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 text-sm">
                      <span className="text-muted-foreground-shadcn">{item.label}</span>
                      <span className={cn("font-medium", toneTextClass(item.tone))}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DisabledSection>
          </div>
        </>
      ) : (
        <>
          {/* Row 1: Hall occupancy + Today's showtimes */}
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Hall occupancy — screenings</h3>
              <div className="space-y-3">
                {dashboard.hallOccupancy?.halls && dashboard.hallOccupancy.halls.length > 0 ? (
                  dashboard.hallOccupancy.halls.map((hall) => (
                    <div key={`${hall.screenId}-${hall.startTime}`}>
                      <div className="mb-1 flex items-center justify-between text-sm my-4">
                        <span className="text-foreground/90">{hall.screenName} · {hall.movieTitle}</span>
                        <span className={cn("font-semibold", toneTextClass(hall.occupancyPercent >= 80 ? "good" : hall.occupancyPercent >= 60 ? "info" : hall.occupancyPercent >= 40 ? "warn" : "danger"))}>
                          {hall.occupancyPercent}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted-shadcn">
                        <div className={cn("h-full rounded-full", occupancyBarColor(hall.occupancyPercent))} style={{ width: `${hall.occupancyPercent}%` }} />
                      </div>
                    </div>
                  ))
                ) : !isLoading ? (
                  <p className="text-xs text-muted-foreground-shadcn py-4">No showtime data available</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Today&apos;s showtime schedule</h3>
              <div className="divide-y divide-border-shadcn">
                {dashboard.hallOccupancy?.halls && dashboard.hallOccupancy.halls.length > 0 ? (
                  dashboard.hallOccupancy.halls.map((hall) => {
                    const seatPct = hall.totalSeats > 0 ? Math.round((hall.soldSeats / hall.totalSeats) * 100) : 0;
                    const seatTone: Tone = seatPct >= 90 ? "info" : seatPct >= 60 ? "good" : seatPct >= 30 ? "warn" : "danger";
                    return (
                      <div key={`st-${hall.screenId}-${hall.startTime}`} className="flex items-center justify-between py-2.5 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {hall.startTime} · {hall.screenName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground-shadcn">
                            {hall.movieTitle}
                          </p>
                        </div>
                        <span className={cn("ml-3 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap", toneBgClass(seatTone))}>
                          {hall.soldSeats} / {hall.totalSeats} seats
                        </span>
                      </div>
                    );
                  })
                ) : !isLoading ? (
                  <p className="text-xs text-muted-foreground-shadcn py-4">No showtime data available</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Row 2: Top movies + Promotions & gift cards */}
          <div className="grid gap-4 xl:grid-cols-2 my-4">
            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Top movies by revenue</h3>
              <div className="divide-y divide-border-shadcn">
                {(() => {
                  const movies = dashboard.summary?.topMovies ?? metrics.topMovies;
                  if (movies.length === 0 && !isLoading) {
                    return <p className="text-xs text-muted-foreground-shadcn py-4">No data available</p>;
                  }
                  return movies.map((movie) => (
                    <div key={movie.movieTitle || movie.showtimeId} className="flex items-center justify-between py-2.5">
                      <span className="text-sm">{movie.movieTitle}</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold">₫{(movie.revenue / 1_000_000).toFixed(1)}M</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Promotions & gift cards</h3>
              <p className="mb-2 text-xs text-muted-foreground-shadcn">Active promotions</p>
              <div className="space-y-2">
                {(dashboard.promotionSummary?.activePromotions ?? []).length > 0 ? (
                  dashboard.promotionSummary!.activePromotions.map((promotion) => (
                    <div key={promotion.name} className="flex items-start justify-between gap-2 my-4">
                      <div className="min-w-0">
                        <p className="text-sm">{promotion.name}</p>
                        {promotion.expiresAt && (
                          <p className="text-xs text-muted-foreground-shadcn">Expires {dayjs(promotion.expiresAt).format("MMM D")}</p>
                        )}
                      </div>
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", toneBgClass(promotion.status === "Active" ? "good" : "warn"))}>
                        {promotion.badge ?? promotion.status}
                      </span>
                    </div>
                  ))
                ) : !isLoading ? (
                  <p className="text-xs text-muted-foreground-shadcn py-2">No active promotions</p>
                ) : null}
              </div>
              <div className="mt-4 border-t border-border-shadcn pt-3">
                <p className="mb-2 text-xs text-muted-foreground-shadcn">Gift card summary</p>
                <div className="flex items-center justify-between text-sm my-4">
                  <span className="text-muted-foreground-shadcn">Active gift codes</span>
                  <span className="font-semibold">{dashboard.promotionSummary?.giftCardSummary?.activeGiftCards ?? "—"}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm my-4">
                  <span className="text-muted-foreground-shadcn">Outstanding balance</span>
                  <span className="font-semibold">{dashboard.promotionSummary?.giftCardSummary ? formatVnd(dashboard.promotionSummary.giftCardSummary.outstandingBalance) : "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3 (disabled): F&B + Workflow + Operational alerts */}
          <div className="grid gap-4 lg:grid-cols-3">
            <DisabledSection title="Coming soon">
              <div className="rounded-xl border border-border-shadcn bg-card p-4">
                <h3 className="mb-3 font-heading text-sm font-semibold">F&B / concessions</h3>
                <p className="mb-2 text-xs text-muted-foreground-shadcn">Top sellers today</p>
                <div className="space-y-1.5 text-sm">
                  {MANAGER_FNB_TOP.map((fnb) => (
                    <div key={fnb.name} className="flex justify-between border-b border-border-shadcn pb-1.5 last:border-0 my-4">
                      <span>{fnb.name}</span>
                      <span className="text-muted-foreground-shadcn">{fnb.sold} sold</span>
                    </div>
                  ))}
                </div>
              </div>
            </DisabledSection>

            <DisabledSection title="Coming soon">
              <WorkflowRequestPanel role={role} />
            </DisabledSection>

            <DisabledSection title="Coming soon">
              <div className="rounded-xl border border-border-shadcn bg-card p-4">
                <h3 className="mb-3 font-heading text-sm font-semibold">{t("admin.executive_dashboard.alerts.title")}</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 rounded-md border border-border-shadcn p-3 my-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium">Operational alerts</p>
                      <p className="text-xs text-muted-foreground-shadcn">No data source connected yet</p>
                    </div>
                  </div>
                </div>
              </div>
            </DisabledSection>
          </div>
        </>
      )}
    </div>
  );
}
