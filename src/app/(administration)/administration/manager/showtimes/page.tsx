"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";

import { cn } from "@/src/@core/utils/cn";
import {
  AdminShowtime,
  mockAdminCinemas,
  mockAdminMovies,
  mockAdminShowtimes,
} from "@/src/@core/const/mock/adminMockData";

import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
  LTTDialog,
  LTTDialogContent,
  LTTDialogHeader,
  LTTDialogTitle,
  LTTDialogFooter,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import {
  LTTSelect,
  LTTSelectContent,
  LTTSelectItem,
  LTTSelectTrigger,
  LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import {
  LTTTabs,
  LTTTabsContent,
  LTTTabsList,
  LTTTabsTrigger,
} from "@/src/@core/component/LTTShadcnUI/LTTTabs";

const statusColor: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed:
    "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
};

const statusLabel: Record<string, string> = {
  scheduled: "Đã lên lịch",
  cancelled: "Đã hủy",
  completed: "Đã chiếu",
};

const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "đ";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 - 22:00
const DAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day === 0 ? 7 : day) - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Movie color palette for calendar blocks (source-style)
const MOVIE_COLORS = [
  "bg-red-500/80 border-red-600 text-white",
  "bg-blue-500/80 border-blue-600 text-white",
  "bg-emerald-500/80 border-emerald-600 text-white",
  "bg-amber-500/80 border-amber-600 text-white",
  "bg-purple-500/80 border-purple-600 text-white",
  "bg-pink-500/80 border-pink-600 text-white",
  "bg-cyan-500/80 border-cyan-600 text-white",
  "bg-orange-500/80 border-orange-600 text-white",
];

export default function ShowtimeSchedulerPage() {
  const [items, setItems] = useState<AdminShowtime[]>(mockAdminShowtimes);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [cinemaFilter, setCinemaFilter] = useState("all");

  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AdminShowtime | null>(null);

  const [form, setForm] = useState({
    movieId: "",
    cinemaId: "",
    screenNumber: "1",
    date: "",
    startTime: "",
    endTime: "",
    format: "2D Phụ Đề Việt",
    basePrice: "105000",
    status: "scheduled" as AdminShowtime["status"],
  });

  // Calendar state (week navigation)
  const [calendarWeek, setCalendarWeek] = useState(new Date());

  const filtered = useMemo(() => {
    let list = items;
    if (dateFilter) list = list.filter((s) => s.date === dateFilter);
    if (cinemaFilter !== "all") list = list.filter((s) => s.cinemaId === cinemaFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.movieTitle.toLowerCase().includes(q));
    }
    return list;
  }, [items, search, dateFilter, cinemaFilter]);

  const weekDates = useMemo(
    () => getWeekDates(calendarWeek),
    [calendarWeek]
  );

  const movieColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const uniqueMovies = [...new Set(items.map((i) => i.movieId))];
    uniqueMovies.forEach((id, idx) => {
      map[id] = MOVIE_COLORS[idx % MOVIE_COLORS.length];
    });
    return map;
  }, [items]);

  const calendarItems = useMemo(() => {
    let list = items;
    if (cinemaFilter !== "all") list = list.filter((s) => s.cinemaId === cinemaFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.movieTitle.toLowerCase().includes(q));
    }
    const weekKeys = weekDates.map(formatDateKey);
    return list.filter((s) => weekKeys.includes(s.date));
  }, [items, cinemaFilter, search, weekDates]);

  const allSel =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const toggleAll = () =>
    allSel
      ? setSelected(new Set())
      : setSelected(new Set(filtered.map((i) => i.id)));
  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const openCreate = (prefillDate?: string, prefillTime?: string) => {
    setEditing(null);
    setForm({
      movieId: "",
      cinemaId: "",
      screenNumber: "1",
      date: prefillDate || "",
      startTime: prefillTime || "",
      endTime: "",
      format: "2D Phụ Đề Việt",
      basePrice: "105000",
      status: "scheduled",
    });
    setDialogOpen(true);
  };

  const openEdit = (s: AdminShowtime) => {
    setEditing(s);
    setForm({
      movieId: s.movieId,
      cinemaId: s.cinemaId,
      screenNumber: String(s.screenNumber),
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      format: s.format,
      basePrice: String(s.basePrice),
      status: s.status,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.movieId || !form.cinemaId || !form.date || !form.startTime) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const movie = mockAdminMovies.find((m) => m.id === form.movieId);
    const cinema = mockAdminCinemas.find((c) => c.id === form.cinemaId);

    if (editing) {
      setItems((p) =>
        p.map((i) =>
          i.id === editing.id
            ? {
                ...i,
                ...form,
                screenNumber: parseInt(form.screenNumber),
                basePrice: parseInt(form.basePrice),
                movieTitle: movie?.title || "",
                cinemaName: cinema?.name || "",
              }
            : i
        )
      );
      toast.success("Cập nhật thành công");
    } else {
      setItems((p) => [
        ...p,
        {
          id: `st-${Date.now()}`,
          ...form,
          screenNumber: parseInt(form.screenNumber),
          basePrice: parseInt(form.basePrice),
          movieTitle: movie?.title || "",
          cinemaName: cinema?.name || "",
        },
      ]);
      toast.success("Tạo mới thành công");
    }

    setDialogOpen(false);
  };

  const bulkDelete = () => {
    setItems((p) => p.filter((i) => !selected.has(i.id)));
    toast.success(`Đã xóa ${selected.size} suất chiếu`);
    setSelected(new Set());
    setDeleteOpen(false);
  };

  const shiftWeek = (dir: number) => {
    const d = new Date(calendarWeek);
    d.setDate(d.getDate() + dir * 7);
    setCalendarWeek(d);
  };

  const goToday = () => setCalendarWeek(new Date());
  const todayKey = formatDateKey(new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Lịch chiếu phim</h1>

        <div className="flex items-center gap-3">
          <LTTTabs
            value={viewMode}
            onValueChange={(v) =>
              setViewMode(v as "table" | "calendar")
            }
          >
            <LTTTabsList className="h-9">
              <LTTTabsTrigger value="table" className="gap-1.5 px-3 text-xs">
                <List className="h-3.5 w-3.5" />
                Bảng
              </LTTTabsTrigger>
              <LTTTabsTrigger
                value="calendar"
                className="gap-1.5 px-3 text-xs"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Lịch
              </LTTTabsTrigger>
            </LTTTabsList>
          </LTTTabs>

          <LTTButton onClick={() => openCreate()} className="gap-2">
            <Plus className="h-4 w-4" /> Thêm suất chiếu
          </LTTButton>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm theo tên phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {viewMode === "table" && (
          <LTTInput
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-44"
          />
        )}

        <LTTSelect
          value={cinemaFilter}
          onValueChange={(v) => setCinemaFilter(v)}
        >
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

        {viewMode === "table" && selected.size > 0 && (
          <LTTButton
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Xóa {selected.size}
          </LTTButton>
        )}
      </div>

      {viewMode === "table" ? (
        <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                <th className="w-10 px-3 py-3">
                  <LTTCheckbox checked={allSel} onCheckedChange={toggleAll} />
                </th>
                <th className="px-4 py-3 text-left font-semibold">Phim</th>
                <th className="px-4 py-3 text-left font-semibold">Rạp</th>
                <th className="px-4 py-3 text-left font-semibold">Phòng</th>
                <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                <th className="px-4 py-3 text-left font-semibold">Giờ chiếu</th>
                <th className="px-4 py-3 text-left font-semibold">Định dạng</th>
                <th className="px-4 py-3 text-left font-semibold">Giá</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-12 text-center text-muted-foreground-shadcn"
                  >
                    Không có dữ liệu lịch chiếu.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors"
                  >
                    <td className="px-3 py-3">
                      <LTTCheckbox
                        checked={selected.has(item.id)}
                        onCheckedChange={() => toggle(item.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{item.movieTitle}</td>
                    <td className="px-4 py-3 text-xs">{item.cinemaName}</td>
                    <td className="px-4 py-3 text-xs">
                      Phòng {item.screenNumber}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.date}</td>
                    <td className="px-4 py-3 text-xs font-semibold">
                      {item.startTime} - {item.endTime}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.format}</td>
                    <td className="px-4 py-3 text-xs">
                      {formatPrice(item.basePrice)}
                    </td>
                    <td className="px-4 py-3">
                      <LTTBadge
                        className={cn("font-medium", statusColor[item.status])}
                      >
                        {statusLabel[item.status]}
                      </LTTBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <LTTButton
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </LTTButton>
                        <LTTButton
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setItems((p) => p.filter((i) => i.id !== item.id));
                            toast.success("Đã xóa suất chiếu");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </LTTButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LTTButton
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => shiftWeek(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </LTTButton>

              <LTTButton
                variant="outline"
                size="sm"
                onClick={goToday}
                className="text-xs"
              >
                Hôm nay
              </LTTButton>

              <LTTButton
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => shiftWeek(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </LTTButton>
            </div>

            <span className="text-sm font-medium text-muted-foreground-shadcn">
              {weekDates[0].toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              })}{" "}
              —{" "}
              {weekDates[6].toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Movie legend */}
          <div className="flex flex-wrap gap-2">
            {[...new Set(calendarItems.map((i) => i.movieId))].map((mid) => {
              const movie = mockAdminMovies.find((m) => m.id === mid);
              return (
                <span
                  key={mid}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    movieColorMap[mid] ||
                    "bg-muted-shadcn/20 text-muted-foreground-shadcn"
                  }`}
                >
                  {movie?.title || mid}
                </span>
              );
            })}
          </div>

          {/* Calendar grid */}
          <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header row */}
                <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border-shadcn bg-muted-shadcn/50">
                  <div className="px-2 py-2 text-xs font-medium text-muted-foreground-shadcn text-center">
                    Giờ
                  </div>
                  {weekDates.map((d, i) => {
                    const key = formatDateKey(d);
                    const isToday = key === todayKey;
                    return (
                      <div
                        key={i}
                        className={`px-2 py-2 text-center border-l border-border-shadcn ${
                          isToday ? "bg-primary-shadcn/10" : ""
                        }`}
                      >
                        <div className="text-xs text-muted-foreground-shadcn">
                          {DAYS_VI[(i + 1) % 7 === 0 ? 0 : (i + 1) % 7]}
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            isToday ? "text-primary-shadcn" : ""
                          }`}
                        >
                          {d.getDate()}/{d.getMonth() + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                <div className="relative">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border-shadcn last:border-0"
                    >
                      <div className="px-2 py-3 text-xs text-muted-foreground-shadcn text-center border-r border-border-shadcn">
                        {String(hour).padStart(2, "0")}:00
                      </div>

                      {weekDates.map((d, di) => {
                        const dateKey = formatDateKey(d);
                        const isToday = dateKey === todayKey;

                        const showtimesInSlot = calendarItems.filter((s) => {
                          if (s.date !== dateKey) return false;
                          const startMin = timeToMinutes(s.startTime);
                          const slotStart = hour * 60;
                          return startMin >= slotStart && startMin < slotStart + 60;
                        });

                        return (
                          <div
                            key={di}
                            className={`relative border-l border-border-shadcn min-h-[52px] cursor-pointer hover:bg-muted-shadcn/20 transition-colors ${
                              isToday ? "bg-primary-shadcn/5" : ""
                            }`}
                            onClick={() =>
                              openCreate(
                                dateKey,
                                `${String(hour).padStart(2, "0")}:00`
                              )
                            }
                          >
                            {showtimesInSlot.map((st) => {
                              const startMin = timeToMinutes(st.startTime);
                              const endMin = st.endTime
                                ? timeToMinutes(st.endTime)
                                : startMin + 120;
                              const durationMin = endMin - startMin;
                              const topOffset =
                                ((startMin - hour * 60) / 60) * 100;
                              const heightPct = (durationMin / 60) * 100;

                              return (
                                <div
                                  key={st.id}
                                  className={`absolute left-0.5 right-0.5 rounded border px-1 py-0.5 overflow-hidden cursor-pointer z-10 ${
                                    movieColorMap[st.movieId] ||
                                    "bg-muted-shadcn/20 text-muted-foreground-shadcn"
                                  } ${
                                    st.status === "cancelled"
                                      ? "opacity-40 line-through"
                                      : ""
                                  }`}
                                  style={{
                                    top: `${topOffset}%`,
                                    height: `${Math.max(
                                      heightPct,
                                      40
                                    )}%`,
                                    minHeight: "20px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEdit(st);
                                  }}
                                  title={`${st.movieTitle}\n${st.startTime} - ${st.endTime}\nPhòng ${st.screenNumber} • ${st.cinemaName}`}
                                >
                                  <div className="text-[10px] font-bold leading-tight truncate">
                                    {st.movieTitle}
                                  </div>
                                  <div className="text-[9px] opacity-90 leading-tight">
                                    {st.startTime}-{st.endTime} • P{st.screenNumber}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>
              {editing ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu mới"}
            </LTTDialogTitle>
          </LTTDialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <LTTLabel>Phim *</LTTLabel>
              <LTTSelect
                value={form.movieId}
                onValueChange={(v) =>
                  setForm({ ...form, movieId: v })
                }
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder="Chọn phim" />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {mockAdminMovies.map((m) => (
                    <LTTSelectItem key={m.id} value={m.id}>
                      {m.title}
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>

            <div className="space-y-2">
              <LTTLabel>Rạp *</LTTLabel>
              <LTTSelect
                value={form.cinemaId}
                onValueChange={(v) =>
                  setForm({ ...form, cinemaId: v })
                }
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder="Chọn rạp" />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {mockAdminCinemas.map((c) => (
                    <LTTSelectItem key={c.id} value={c.id}>
                      {c.name}
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>

            <div className="space-y-2">
              <LTTLabel>Phòng chiếu (số)</LTTLabel>
              <LTTInput
                type="number"
                value={form.screenNumber}
                onChange={(e) =>
                  setForm({ ...form, screenNumber: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <LTTLabel>Ngày chiếu *</LTTLabel>
              <LTTInput
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <LTTLabel>Giờ bắt đầu *</LTTLabel>
              <LTTInput
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <LTTLabel>Giờ kết thúc</LTTLabel>
              <LTTInput
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm({ ...form, endTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <LTTLabel>Định dạng phim</LTTLabel>
              <LTTInput
                value={form.format}
                onChange={(e) =>
                  setForm({ ...form, format: e.target.value })
                }
                placeholder="VD: 2D Phụ Đề Việt"
              />
            </div>

            <div className="space-y-2">
              <LTTLabel>Giá cơ bản (VNĐ)</LTTLabel>
              <LTTInput
                type="number"
                value={form.basePrice}
                onChange={(e) =>
                  setForm({ ...form, basePrice: e.target.value })
                }
              />
            </div>
          </div>

          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </LTTButton>
            <LTTButton onClick={save}>
              {editing ? "Lưu thay đổi" : "Tạo suất chiếu"}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      {/* Bulk Delete Dialog */}
      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa suất chiếu</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              Bạn có chắc chắn muốn xóa{" "}
              <strong>{selected.size}</strong> suất chiếu đã chọn? Điều này sẽ gỡ suất chiếu khỏi hệ thống đặt vé.
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>
              Hủy
            </LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete}>
              Xác nhận xóa
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}

