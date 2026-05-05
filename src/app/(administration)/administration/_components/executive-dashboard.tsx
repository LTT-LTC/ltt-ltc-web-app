"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
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

const ADMIN_KPIS: KpiItem[] = [
  { labelKey: "revenue_today", value: "₫84.2M", deltaKey: "revenue_today_delta", deltaTone: "good", subKey: "revenue_today_sub", subTone: "good" },
  { labelKey: "tickets_sold_today", value: "1,847", deltaKey: "tickets_sold_today_delta", deltaTone: "good", subKey: "tickets_sold_today_sub", subTone: "good" },
  { labelKey: "avg_occupancy_rate", value: "63%", deltaKey: "avg_occupancy_rate_delta", deltaTone: "neutral", subKey: "avg_occupancy_rate_sub", subTone: "warn" },
  { labelKey: "member_transactions", value: "41%", deltaKey: "member_transactions_delta", deltaTone: "neutral", subKey: "member_transactions_sub", subTone: "info" },
];

const MANAGER_KPIS: KpiItem[] = [
  { labelKey: "revenue_today", value: "₫31.4M", deltaKey: "manager_revenue_today_delta", deltaTone: "good", subKey: "manager_revenue_today_sub", subTone: "good" },
  { labelKey: "tickets_sold", value: "623", deltaKey: "tickets_sold_delta", deltaTone: "neutral", subKey: "tickets_sold_sub", subTone: "info" },
  { labelKey: "fnb_spend_per_head", value: "₫48K", deltaKey: "fnb_spend_per_head_delta", deltaTone: "warn", subKey: "fnb_spend_per_head_sub", subTone: "warn" },
  { labelKey: "avg_occupancy", value: "58%", deltaKey: "avg_occupancy_delta", deltaTone: "neutral", subKey: "avg_occupancy_sub", subTone: "warn" },
];

const REVENUE_TREND = [
  { day: "Mon", tickets: 48, fnb: 22, gift: 4 },
  { day: "Tue", tickets: 45, fnb: 20, gift: 3 },
  { day: "Wed", tickets: 52, fnb: 24, gift: 4 },
  { day: "Thu", tickets: 58, fnb: 26, gift: 5 },
  { day: "Fri", tickets: 78, fnb: 32, gift: 7 },
  { day: "Sat", tickets: 92, fnb: 40, gift: 8 },
  { day: "Sun", tickets: 82, fnb: 36, gift: 6 },
];

const MANAGER_HOURLY_REVENUE = [
  { h: "10", today: 1.2, yest: 1.0 },
  { h: "11", today: 2.4, yest: 2.1 },
  { h: "12", today: 4.1, yest: 3.6 },
  { h: "13", today: 4.8, yest: 4.5 },
  { h: "14", today: 5.6, yest: 5.0 },
  { h: "15", today: 5.4, yest: 5.2 },
  { h: "16", today: null as number | null, yest: 4.0 },
  { h: "17", today: null as number | null, yest: 3.0 },
  { h: "18", today: null as number | null, yest: 5.5 },
  { h: "19", today: null as number | null, yest: 8.5 },
  { h: "20", today: null as number | null, yest: 7.6 },
  { h: "21", today: null as number | null, yest: 3.0 },
];

const ADMIN_HALLS = [
  { name: "Hall 1 · Inception 2", pct: 91 },
  { name: "Hall 2 · The Wild Robot 2", pct: 87 },
  { name: "Hall 3 · Venom 3", pct: 74 },
  { name: "Hall 4 · Paddington 4", pct: 68 },
  { name: "Hall 5 · Quiet Place 3", pct: 38 },
  { name: "Hall 6 · Archive (limited)", pct: 21 },
];

const ADMIN_TOP_MOVIES = [
  { title: "Inception 2", revenue: "₫18.4M", badge: "8 days left", tone: "good" as Tone },
  { title: "The Wild Robot 2", revenue: "₫15.1M", badge: "14 days left", tone: "good" as Tone },
  { title: "Venom 3", revenue: "₫11.8M", badge: "3 days left", tone: "warn" as Tone },
  { title: "Paddington 4", revenue: "₫9.2M", badge: "21 days left", tone: "info" as Tone },
  { title: "Quiet Place 3", revenue: "₫4.1M", badge: "Low yield", tone: "danger" as Tone },
];

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

type ScreenState = "now_showing" | "cleaning" | "idle" | "maintenance";

const MANAGER_SCREENS: {
  id: number;
  seats: number;
  state: ScreenState;
  title: string;
  sold?: number;
  bottomLeft: string;
  bottomRight: string;
}[] = [
  { id: 1, seats: 210, state: "now_showing", title: "Inception 2 · 14:00 session", sold: 191, bottomLeft: "191 / 210 seats", bottomRight: "Ends 16:12" },
  { id: 2, seats: 180, state: "now_showing", title: "The Wild Robot 2 · 14:15 session", sold: 149, bottomLeft: "149 / 180 seats", bottomRight: "Ends 16:05" },
  { id: 3, seats: 200, state: "cleaning", title: "Next: Venom 3 · 15:00 session", sold: 68, bottomLeft: "Ready in ~8 min", bottomRight: "68 sold / 200" },
  { id: 4, seats: 160, state: "now_showing", title: "Paddington 4 · 13:30 session", sold: 99, bottomLeft: "99 / 160 seats", bottomRight: "Ends 15:22" },
  { id: 5, seats: 140, state: "idle", title: "Next: Quiet Place 3 · 16:30 session", sold: 40, bottomLeft: "Only 40 sold / 140", bottomRight: "Idle 110 min" },
  { id: 6, seats: 130, state: "maintenance", title: "Projector lamp replacement", bottomLeft: "Est. back 17:30", bottomRight: "2 shows cancelled" },
];

const MANAGER_SHOWTIMES = [
  { time: "14:00", screen: "Sc.1", title: "Inception 2", dur: "132 min", seats: "191 / 210", tone: "good" as Tone },
  { time: "14:15", screen: "Sc.2", title: "Wild Robot 2", dur: "110 min", seats: "149 / 180", tone: "good" as Tone },
  { time: "15:00", screen: "Sc.3", title: "Venom 3", dur: "112 min", seats: "68 / 200", tone: "warn" as Tone },
  { time: "16:00", screen: "Sc.1", title: "Inception 2", dur: "132 min", seats: "144 / 210", tone: "info" as Tone },
  { time: "16:30", screen: "Sc.5", title: "Quiet Place 3", dur: "98 min", seats: "40 / 140 · Push promo", tone: "danger" as Tone },
  { time: "19:00", screen: "Sc.2", title: "Wild Robot 2", dur: "110 min", seats: "201 / 180 — FULL", tone: "info" as Tone },
  { time: "20:00", screen: "Sc.3", title: "Venom 3", dur: "112 min", seats: "Draft — confirm", tone: "draft" as Tone },
];

const MANAGER_FNB_TOP = [
  { name: "Combo L (popcorn+drink)", sold: 312 },
  { name: "Nachos set", sold: 148 },
  { name: "Hotdog", sold: 91 },
];

const MANAGER_FNB_STOCK = [
  { name: "Popcorn (lg)", pct: 11, color: "bg-red-500", text: "text-red-600" },
  { name: "Nachos", pct: 28, color: "bg-amber-500", text: "text-amber-600" },
  { name: "Cola (500ml)", pct: 74, color: "bg-emerald-500", text: "text-emerald-600" },
  { name: "Hotdog", pct: 61, color: "bg-emerald-500", text: "text-emerald-600" },
];

const MANAGER_PROMOTIONS = [
  { name: "Student Wed -15%", sub: "Expires tonight", badge: "↑ 41%", tone: "good" as Tone },
  { name: "Combo upgrade ₫10K", sub: "Running all week", badge: "↑ 29%", tone: "good" as Tone },
  { name: "Last-row couples deal", sub: "Draft — not live", badge: "Pending", tone: "warn" as Tone },
];

const MANAGER_PRICING_RULES = [
  { name: "Peak surcharge (Sc.1, Sc.2)", badge: "Triggered", tone: "good" as Tone },
  { name: "Early-bird -10% (before 12pm)", badge: "Active", tone: "info" as Tone },
  { name: "VIP recliner premium +₫30K", badge: "Active", tone: "info" as Tone },
];

const ADMIN_WORKFLOW_LINKS: WorkflowLink[] = [
  { key: "refund_requests", href: "/administration/admin/refunds", count: "312", tone: "warn" },
  { key: "booking_monitoring", href: "/administration/admin/bookings", count: "24", tone: "info" },
  { key: "member_card_requests", href: "/administration/admin/member-card-request", count: "18", tone: "danger" },
];

const MANAGER_WORKFLOW_LINKS: WorkflowLink[] = [
  { key: "refund_requests", href: "/administration/manager/refunds", count: "27", tone: "warn" },
  { key: "booking_monitoring", href: "/administration/manager/bookings", count: "11", tone: "info" },
  { key: "member_card_requests_admin", href: "/administration/admin/member-card-request", count: "9", tone: "danger" },
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

const screenStateBadge: Record<ScreenState, { label: string; cls: string }> = {
  now_showing: { label: "Now showing", cls: "bg-emerald-100 text-emerald-700" },
  cleaning: { label: "Cleaning", cls: "bg-blue-100 text-blue-700" },
  idle: { label: "Idle", cls: "bg-muted-shadcn text-muted-foreground-shadcn" },
  maintenance: { label: "Maintenance", cls: "bg-red-100 text-red-700" },
};

const screenStateBar: Record<ScreenState, string> = {
  now_showing: "bg-emerald-500",
  cleaning: "bg-blue-500",
  idle: "bg-amber-500",
  maintenance: "bg-red-500",
};

const occupancyBarColor = (pct: number): string =>
  pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";

function RangeFilter() {
  const { t } = useLocalization();
  const [range, setRange] = useState("today");
  const [customOpen, setCustomOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="flex items-center gap-2">
      <LTTSelect
        value={range}
        onValueChange={(value) => {
          setRange(value);
          if (value === "custom") {
            setCustomOpen(true);
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
                setRange("custom");
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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            className="flex items-center justify-between rounded-md border border-border-shadcn p-3 transition-colors hover:bg-muted-shadcn/40"
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

export function ExecutiveDashboard({ role }: { role: DashboardRole }) {
  const { t } = useLocalization();
  const kpis = role === "admin" ? ADMIN_KPIS : MANAGER_KPIS;
  const titleKey = role === "admin" ? "admin_title" : "manager_title";
  const subtitleKey = role === "admin" ? "admin_subtitle" : "manager_subtitle";
  const ticketLegend = useMemo(() => t("admin.executive_dashboard.charts.ticket_legend"), [t]);
  const fnbLegend = useMemo(() => t("admin.executive_dashboard.charts.fnb_legend"), [t]);
  const giftLegend = useMemo(() => t("admin.executive_dashboard.charts.gift_legend"), [t]);
  const todayLegend = useMemo(() => t("admin.executive_dashboard.charts.today"), [t]);
  const yesterdayLegend = useMemo(() => t("admin.executive_dashboard.charts.yesterday"), [t]);
  const formatCurrencyMillions = (value: unknown) => {
    const raw = Array.isArray(value) ? value[0] : value;
    return raw == null ? "—" : `₫${raw}M`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">{t(`admin.executive_dashboard.${titleKey}`)}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground-shadcn">{t(`admin.executive_dashboard.${subtitleKey}`)}</p>
        </div>
        <div className="flex items-center gap-2">
          <RangeFilter />
          <LTTButton variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t("admin.executive_dashboard.export_report")}
          </LTTButton>
        </div>
      </div>

      <KpiStrip items={kpis} />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border-shadcn bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold">{t("admin.executive_dashboard.charts.revenue_breakdown_title")}</h3>
            <span className="text-[11px] text-muted-foreground-shadcn">{t("admin.executive_dashboard.charts.revenue_breakdown_subtitle")}</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={REVENUE_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₫${value}M`} />
              <Tooltip formatter={formatCurrencyMillions} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="tickets" stackId="a" name={ticketLegend} fill="hsl(217 91% 60%)" />
              <Bar dataKey="fnb" stackId="a" name={fnbLegend} fill="hsl(160 84% 39%)" />
              <Bar dataKey="gift" stackId="a" name={giftLegend} fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border-shadcn bg-card p-4">
          <h3 className="mb-3 font-heading text-sm font-semibold">{t("admin.executive_dashboard.charts.hourly_revenue_title")}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={MANAGER_HOURLY_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="h" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `₫${value}M`} />
              <Tooltip formatter={formatCurrencyMillions} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="today" name={todayLegend} stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="yest" name={yesterdayLegend} stroke="hsl(0 0% 60%)" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {role === "admin" ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Hall occupancy — today&apos;s screenings</h3>
              <div className="space-y-3">
                {ADMIN_HALLS.map((hall) => (
                  <div key={hall.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-foreground/90">{hall.name}</span>
                      <span className={cn("font-semibold", toneTextClass(hall.pct >= 80 ? "good" : hall.pct >= 60 ? "info" : hall.pct >= 40 ? "warn" : "danger"))}>
                        {hall.pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted-shadcn">
                      <div className={cn("h-full rounded-full", occupancyBarColor(hall.pct))} style={{ width: `${hall.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <WorkflowRequestPanel role={role} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Top movies by revenue</h3>
              <div className="divide-y divide-border-shadcn">
                {ADMIN_TOP_MOVIES.map((movie) => (
                  <div key={movie.title} className="flex items-center justify-between py-2.5">
                    <span className="text-sm">{movie.title}</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{movie.revenue}</p>
                      <span className={cn("mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium", toneBgClass(movie.tone))}>{movie.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Member loyalty health</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground-shadcn">New sign-ups today</span>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex items-center justify-between border-t border-border-shadcn pt-2.5">
                  <span className="text-muted-foreground-shadcn">Pending card requests</span>
                  <LTTBadge variant="destructive">312 Action needed</LTTBadge>
                </div>
                <div className="flex items-center justify-between border-t border-border-shadcn pt-2.5">
                  <span className="text-muted-foreground-shadcn">Points redeemed today</span>
                  <span className="font-semibold">2,840 pts</span>
                </div>
                <div className="border-t border-border-shadcn pt-2.5">
                  <p className="mb-2 text-xs text-muted-foreground-shadcn">Member tier distribution</p>
                  <div className="space-y-2">
                    {ADMIN_MEMBER_TIERS.map((tier) => (
                      <div key={tier.name}>
                        <div className="flex justify-between text-xs">
                          <span>{tier.name}</span>
                          <span>{tier.pct}%</span>
                        </div>
                        <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted-shadcn">
                          <div className={cn("h-full", tier.color)} style={{ width: `${tier.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Promotions & gift cards</h3>
              <p className="mb-2 text-xs text-muted-foreground-shadcn">Active promotions</p>
              <div className="space-y-2">
                {ADMIN_PROMOTIONS.map((promotion) => (
                  <div key={promotion.name} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{promotion.name}</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", toneBgClass(promotion.tone))}>{promotion.badge}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-border-shadcn pt-3">
                <p className="mb-2 text-xs text-muted-foreground-shadcn">Gift card liability</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground-shadcn">Outstanding balance</span>
                  <span className="font-semibold">₫142M</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground-shadcn">Redeemed today</span>
                  <span className="font-semibold">₫6.3M</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">{t("admin.executive_dashboard.alerts.title")}</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 rounded-md border border-border-shadcn p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium">{t("admin.executive_dashboard.alerts.occupancy_low_title")}</p>
                    <p className="text-xs text-muted-foreground-shadcn">{t("admin.executive_dashboard.alerts.occupancy_low_desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-border-shadcn p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">{t("admin.executive_dashboard.alerts.stock_low_title")}</p>
                    <p className="text-xs text-muted-foreground-shadcn">{t("admin.executive_dashboard.alerts.stock_low_desc")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-border-shadcn p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">{t("admin.executive_dashboard.alerts.system_ok_title")}</p>
                    <p className="text-xs text-muted-foreground-shadcn">{t("admin.executive_dashboard.alerts.system_ok_desc")}</p>
                  </div>
                </div>
              </div>
            </div>

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
          </div>
        </>
      ) : (
        <>
          <div className="rounded-xl border border-border-shadcn bg-card p-4">
            <h3 className="mb-3 font-heading text-sm font-semibold">Live screen status</h3>
            <div className="grid gap-3 lg:grid-cols-2">
              {MANAGER_SCREENS.map((screen) => {
                const pct =
                  screen.sold && screen.state !== "maintenance"
                    ? Math.min(100, Math.round((screen.sold / screen.seats) * 100))
                    : screen.state === "maintenance"
                      ? 100
                      : 0;

                return (
                  <div key={screen.id} className="rounded-lg border border-border-shadcn p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          Screen {screen.id} · {screen.seats} seats
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground-shadcn">{screen.title}</p>
                      </div>
                      <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium", screenStateBadge[screen.state].cls)}>
                        {screenStateBadge[screen.state].label}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted-shadcn">
                      <div className={cn("h-full rounded-full", screenStateBar[screen.state])} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className={screen.state === "idle" ? "text-amber-600" : screen.state === "maintenance" ? "text-red-600" : "text-muted-foreground-shadcn"}>
                        {screen.bottomLeft}
                      </span>
                      <span className="text-muted-foreground-shadcn">{screen.bottomRight}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Today&apos;s showtime schedule</h3>
              <div className="divide-y divide-border-shadcn">
                {MANAGER_SHOWTIMES.map((showtime) => (
                  <div key={`${showtime.time}-${showtime.screen}`} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {showtime.time} · {showtime.screen}
                      </p>
                      <p className="truncate text-xs text-muted-foreground-shadcn">
                        {showtime.title} · {showtime.dur}
                      </p>
                    </div>
                    <span className={cn("ml-3 rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap", toneBgClass(showtime.tone))}>
                      {showtime.seats}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <WorkflowRequestPanel role={role} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">F&B / concessions</h3>
              <p className="mb-2 text-xs text-muted-foreground-shadcn">Top sellers today</p>
              <div className="space-y-1.5 text-sm">
                {MANAGER_FNB_TOP.map((fnb) => (
                  <div key={fnb.name} className="flex justify-between border-b border-border-shadcn pb-1.5 last:border-0">
                    <span>{fnb.name}</span>
                    <span className="text-muted-foreground-shadcn">{fnb.sold} sold</span>
                  </div>
                ))}
              </div>
              <p className="mb-2 mt-4 text-xs text-muted-foreground-shadcn">Stock levels</p>
              <div className="space-y-2">
                {MANAGER_FNB_STOCK.map((stock) => (
                  <div key={stock.name}>
                    <div className="flex justify-between text-xs">
                      <span>{stock.name}</span>
                      <span className={cn("font-semibold", stock.text)}>{stock.pct}%</span>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted-shadcn">
                      <div className={cn("h-full", stock.color)} style={{ width: `${stock.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Promotions & pricing</h3>
              <p className="mb-2 text-xs text-muted-foreground-shadcn">Active local promotions</p>
              <div className="space-y-2">
                {MANAGER_PROMOTIONS.map((promotion) => (
                  <div key={promotion.name} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm">{promotion.name}</p>
                      <p className="text-xs text-muted-foreground-shadcn">{promotion.sub}</p>
                    </div>
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", toneBgClass(promotion.tone))}>
                      {promotion.badge}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mb-2 mt-4 text-xs text-muted-foreground-shadcn">Pricing rules active</p>
              <div className="space-y-2">
                {MANAGER_PRICING_RULES.map((rule) => (
                  <div key={rule.name} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{rule.name}</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", toneBgClass(rule.tone))}>
                      {rule.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border-shadcn bg-card p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">{t("admin.executive_dashboard.alerts.title")}</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 rounded-md border border-border-shadcn p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Screen 6 down — 2 shows cancelled</p>
                    <p className="text-xs text-muted-foreground-shadcn">Lamp replacement in progress, est. back 17:30</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-border-shadcn p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium">F&B spend/head below target</p>
                    <p className="text-xs text-muted-foreground-shadcn">Brief concession staff before 19:00 rush.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-border-shadcn p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">19:00 Wild Robot 2 fully sold</p>
                    <p className="text-xs text-muted-foreground-shadcn">Consider waitlist or standby queue.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
