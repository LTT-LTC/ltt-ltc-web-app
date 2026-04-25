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
  RefreshCw,
} from "lucide-react";

import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { showtimeService } from "@/src/services/administration-service/showtime/showtime.service";
import { movieService } from "@/src/services/administration-service/movie/movie.service";
import { screenService } from "@/src/services/administration-service/screen/screen.service";
import { CreateShowtimeInputDto } from "@/src/services/administration-service/showtime/models/input.model";
import { ShowtimeOutputDto } from "@/src/services/administration-service/showtime/models/output.model";
import { MovieDistributionOutputDto, MovieOutputDto } from "@/src/services/administration-service/movie/models/output.model";
import { ScreenOutputDto } from "@/src/services/administration-service/screen/models/output.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { useEffect } from "react";
import { cn } from "@/src/@core/utils/cn";
import { getCookie } from "@/src/@core/utils/cookie";
import { ADMIN_ACCESS_TOKEN_KEY } from "@/src/@core/const";
import { getUserInfoFromToken } from "@/src/@core/utils/jwt";
import { useLocalization } from "@/src/@core/hooks/use-localization";

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
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

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
  const { t } = useLocalization();
  type ShowtimeFormState = {
    movieId: string;
    cinemaId: string;
    screenId: string;
    movieDistributionId: string;
    date: string;
    startTime: string;
    endTime: string;
    format?: string;
    language?: string;
    caption?: string;
    basePrice?: string | number;
  };
  const [items, setItems] = useState<ShowtimeOutputDto[]>([]);
  const [movies, setMovies] = useState<MovieOutputDto[]>([]);
  const [distributions, setDistributions] = useState<MovieDistributionOutputDto[]>([]);
  const [screens, setScreens] = useState<ScreenOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [managerCinemaId, setManagerCinemaId] = useState("");
  const [cinemaMissing, setCinemaMissing] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ShowtimeOutputDto | null>(null);
  const [calendarWeek, setCalendarWeek] = useState(new Date());
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [singleDeleteId, setSingleDeleteId] = useState("");
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);

  const normalizeMovieStatus = (status?: string) => (status || "").trim().toLowerCase();
  const allowedMovieStatuses = new Set(["now_showing", "coming_soon", "comming_soon"]);
  const now = new Date();
  const nowTime = now.getTime();

  const isDistributionValidNow = (distribution: MovieDistributionOutputDto) => {
    const startTime = distribution.licenseStartDate ? new Date(distribution.licenseStartDate).getTime() : Number.NEGATIVE_INFINITY;
    const endTime = distribution.licenseEndDate ? new Date(distribution.licenseEndDate).getTime() : Number.POSITIVE_INFINITY;
    return nowTime >= startTime && nowTime <= endTime;
  };

  const activeDistributions = useMemo(
    () => distributions.filter(isDistributionValidNow),
    [distributions]
  );

  const activeDistributionMap = useMemo(() => {
    const map = new Map<string, MovieDistributionOutputDto>();
    for (const distribution of activeDistributions) {
      if (!map.has(distribution.movieId)) {
        map.set(distribution.movieId, distribution);
      }
    }
    return map;
  }, [activeDistributions]);

  const eligibleMovies = useMemo(
    () =>
      movies.filter(
        (movie) =>
          allowedMovieStatuses.has(normalizeMovieStatus(movie.status)) &&
          activeDistributionMap.has(movie.id)
      ),
    [movies, activeDistributionMap]
  );

  const effectiveMovieId = selectedMovieId || eligibleMovies[0]?.id || "";

  const [form, setForm] = useState<ShowtimeFormState>({
    movieId: "",
    cinemaId: "",
    screenId: "",
    movieDistributionId: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const listMutation = useLTTMutation<PagedResultDto<ShowtimeOutputDto> | undefined, { movieId: string; cinemaId: string; page: number; fetch: number }>({
    mutationFn: (params) => showtimeService.getShowtimeListAsync(params),
    onSuccess: (res) => {
      if (res && res.items) {
        setItems(res.items);
        setTotalCount(res.totalCount);
      }
    },
    onError: (err) => toast.error(err.message || t("admin.showtimes.fetch_error"))
  });

  const movieMutation = useLTTMutation<PagedResultDto<MovieOutputDto> | undefined, { page: number; fetch: number }>({
    mutationFn: (p) => movieService.getMovieListAsync(p),
    onSuccess: (res) => { if (res && res.items) setMovies(res.items); }
  });
  const distributionMutation = useLTTMutation<PagedResultDto<MovieDistributionOutputDto> | undefined, void>({
    mutationFn: () => movieService.getDistributionsAsync({ skipCount: 0, maxResultCount: 1000 }),
    onSuccess: (res) => { if (res?.items) setDistributions(res.items); },
    onError: (err) => toast.error(err.message || t("admin.showtimes.distribution_fetch_error"))
  });

  const screenMutation = useLTTMutation<PagedResultDto<ScreenOutputDto> | undefined, void>({
    mutationFn: () => screenService.getScreenListAsync(managerCinemaId, { page: 1, fetch: 100 }),
    onSuccess: (res) => { if (res && res.items) setScreens(res.items); }
  });

  const createMutation = useLTTMutation<ShowtimeOutputDto | undefined, CreateShowtimeInputDto>({
    mutationFn: (body) => showtimeService.createShowtimeAsync(body),
    onSuccess: () => { toast.success(t("admin.showtimes.create_success")); fetchData(); setDialogOpen(false); }
  });
  const deleteMutation = useLTTMutation<void, string>({
    mutationFn: (id) => showtimeService.deleteShowtimeAsync(id),
    onError: (err) => toast.error(err.message || t("admin.showtimes.delete_error")),
  });

  const loading =
    listMutation.isLoading ||
    createMutation.isLoading ||
    movieMutation.isLoading ||
    distributionMutation.isLoading ||
    screenMutation.isLoading;

  const fetchData = () => {
    if (!effectiveMovieId) return;
    listMutation.mutation({
      movieId: effectiveMovieId,
      cinemaId: managerCinemaId,
      page,
      fetch,
    });
  };

  useEffect(() => {
    const accessToken = getCookie(ADMIN_ACCESS_TOKEN_KEY);
    const userInfo = accessToken ? getUserInfoFromToken(accessToken) : null;
    const cinemaId = userInfo?.cinemaId?.trim() || "";
    if (!cinemaId) {
      setCinemaMissing(true);
      toast.error(t("admin.showtimes.cinema_claim_missing"));
      return;
    }
    setManagerCinemaId(cinemaId);
  }, []);

  useEffect(() => {
    if (!managerCinemaId || !effectiveMovieId) return;
    fetchData();
  }, [managerCinemaId, effectiveMovieId, page, fetch]);

  useEffect(() => {
    movieMutation.mutation({ page: 1, fetch: 100 });
    distributionMutation.mutation();
  }, []);

  useEffect(() => {
    if (selectedMovieId && !eligibleMovies.some((m) => m.id === selectedMovieId)) {
      setSelectedMovieId("");
    }
  }, [eligibleMovies, selectedMovieId]);

  useEffect(() => {
    if (!managerCinemaId) return;
    screenMutation.mutation();
  }, [managerCinemaId]);

  const filtered = items; // Backend handled filter ideally, or we can filter locally if needed.

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
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.movieTitle?.toLowerCase().includes(q));
    }
    const weekKeys = weekDates.map(formatDateKey);
    return list.filter((s) => s.date && weekKeys.includes(s.date));
  }, [items, search, weekDates]);

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
    const defaultMovieId = selectedMovieId || eligibleMovies[0]?.id || "";
    const defaultDistributionId = defaultMovieId ? activeDistributionMap.get(defaultMovieId)?.id || "" : "";
    setEditing(null);
    setForm({
      movieId: defaultMovieId,
      cinemaId: managerCinemaId,
      screenId: "",
      movieDistributionId: defaultDistributionId,
      date: prefillDate || "",
      startTime: prefillTime || "",
      endTime: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (s: ShowtimeOutputDto) => {
    const distributionId = activeDistributionMap.get(s.movieId)?.id || "";
    setEditing(s);
    setForm({
      movieId: s.movieId,
      cinemaId: managerCinemaId,
      screenId: s.screenId,
      movieDistributionId: distributionId,
      date: s.startTime.split("T")[0],
      startTime: s.startTime.split("T")[1].substring(0, 5),
      endTime: s.endTime.split("T")[1].substring(0, 5),
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.movieId || !form.cinemaId || !form.screenId || !form.movieDistributionId || !form.date || !form.startTime) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const start = `${form.date}T${form.startTime}:00Z`;
    const end = `${form.date}T${form.endTime || "23:59"}:00Z`;

    const movieFormatJson = JSON.stringify({
      movie_format: form.format || "2D",
      movie_language: form.language || "Vietnamese",
      movie_caption: form.caption || "Vietsub",
    });
    createMutation.mutation({
      movieId: form.movieId,
      cinemaId: form.cinemaId,
      screenId: form.screenId,
      distributionId: form.movieDistributionId,
      showDate: form.date,
      startTime: start,
      endTime: end,
      basePrice: Number(form.basePrice || 0),
      movieFormat: movieFormatJson,
    });
  };

  const bulkDelete = () => {
    Promise.allSettled(Array.from(selected).map((id) => deleteMutation.mutation(id))).then((results) => {
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed === 0) {
        toast.success(t("admin.showtimes.bulk_delete_success", { count: selected.size }));
      } else {
        toast.error(t("admin.showtimes.bulk_delete_partial", { success: selected.size - failed, total: selected.size }));
      }
      setSelected(new Set());
      setDeleteOpen(false);
      fetchData();
    });
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
        <h1 className="font-heading text-2xl font-bold">{t("admin.showtimes.title")}</h1>

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
                {t("admin.showtimes.view.table")}
              </LTTTabsTrigger>
              <LTTTabsTrigger
                value="calendar"
                className="gap-1.5 px-3 text-xs"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {t("admin.showtimes.view.calendar")}
              </LTTTabsTrigger>
            </LTTTabsList>
          </LTTTabs>

          <LTTButton onClick={() => openCreate()} className="gap-2" disabled={!managerCinemaId || cinemaMissing}>
            <Plus className="h-4 w-4" /> {t("admin.showtimes.add")}
          </LTTButton>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.showtimes.search_placeholder")}
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
        <LTTSelect value={effectiveMovieId} onValueChange={(v) => { setSelectedMovieId(v); setPage(1); }}>
          <LTTSelectTrigger className="w-64">
            <LTTSelectValue placeholder="Chọn phim để tải lịch" />
          </LTTSelectTrigger>
          <LTTSelectContent>
            {eligibleMovies.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">
                No distributed valid movies available for this cinema now.
              </div>
            ) : (
              eligibleMovies.map((m) => (
                <LTTSelectItem key={m.id} value={m.id}>{m.title}</LTTSelectItem>
              ))
            )}
          </LTTSelectContent>
        </LTTSelect>
        <LTTButton variant="outline" className="gap-2" onClick={fetchData} loading={listMutation.isLoading}>
          <RefreshCw className="h-4 w-4" /> Làm mới
        </LTTButton>
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
              {loading ? (
                <DomainTableStateRow colSpan={10} state="loading" loadingText="Đang tải dữ liệu lịch chiếu..." />
              ) : filtered.length === 0 ? (
                <DomainTableStateRow colSpan={10} state="empty" emptyText="Không có dữ liệu lịch chiếu." />
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
                    <td className="px-4 py-3 text-xs">—</td>
                    <td className="px-4 py-3 text-xs">
                      {item.screenName}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.startTime?.split("T")[0]}</td>
                    <td className="px-4 py-3 text-xs font-semibold">
                      {item.startTime?.split("T")[1].substring(0, 5)} - {item.endTime?.split("T")[1].substring(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-xs">{item.format}</td>
                    <td className="px-4 py-3 text-xs">
                      {formatPrice(item.basePrice ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <LTTBadge
                        className={cn("font-medium", statusColor[item.status || "active"])}
                      >
                        {statusLabel[item.status || "active"]}
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
                            setSingleDeleteId(item.id);
                            setSingleDeleteOpen(true);
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
              const movie = movies.find((m) => m.id === mid);
              return (
                <span
                  key={mid}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${movieColorMap[mid] ||
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
                        className={`px-2 py-2 text-center border-l border-border-shadcn ${isToday ? "bg-primary-shadcn/10" : ""
                          }`}
                      >
                        <div className="text-xs text-muted-foreground-shadcn">
                          {DAYS_VI[(i + 1) % 7 === 0 ? 0 : (i + 1) % 7]}
                        </div>
                        <div
                          className={`text-sm font-semibold ${isToday ? "text-primary-shadcn" : ""
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
                            className={`relative border-l border-border-shadcn min-h-[52px] cursor-pointer hover:bg-muted-shadcn/20 transition-colors ${isToday ? "bg-primary-shadcn/5" : ""
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
                                  className={`absolute left-0.5 right-0.5 rounded border px-1 py-0.5 overflow-hidden cursor-pointer z-10 ${movieColorMap[st.movieId] ||
                                    "bg-muted-shadcn/20 text-muted-foreground-shadcn"
                                    } ${st.status === "cancelled"
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
                                  title={`${st.movieTitle}\n${st.startTime} - ${st.endTime}\nPhòng ${st.screenName} • ${st.cinemaName}`}
                                >
                                  <div className="text-[10px] font-bold leading-tight truncate">
                                    {st.movieTitle}
                                  </div>
                                  <div className="text-[9px] opacity-90 leading-tight">
                                    {st.startTime}-{st.endTime} • P{st.screenName}
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
      {viewMode === "table" && (
        <AdminTablePagination
          totalCount={totalCount}
          page={page}
          pageSize={fetch}
          onPageChange={(nextPage) => setPage(nextPage)}
          onPageSizeChange={(nextSize) => {
            setFetch(nextSize);
            setPage(1);
          }}
          loading={listMutation.isLoading}
        />
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
              <LTTLabel>{t("admin.showtimes.form.movie")}</LTTLabel>
              <LTTSelect
                value={form.movieId}
                onValueChange={(v) => {
                  const distributionId = activeDistributionMap.get(v)?.id || "";
                  setForm({ ...form, movieId: v, movieDistributionId: distributionId });
                }}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder={t("admin.showtimes.form.movie_placeholder")} />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {eligibleMovies.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">
                      No distributed valid movies available for this cinema now.
                    </div>
                  ) : (
                    eligibleMovies.map((m) => (
                      <LTTSelectItem key={m.id} value={m.id}>
                        {m.title}
                      </LTTSelectItem>
                    ))
                  )}
                </LTTSelectContent>
              </LTTSelect>
            </div>

            <div className="space-y-2">
              <LTTLabel>{t("admin.showtimes.form.screen")}</LTTLabel>
              <LTTSelect
                value={form.screenId}
                onValueChange={(v) =>
                  setForm({ ...form, screenId: v })
                }
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder={t("admin.showtimes.form.screen_placeholder")} />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {screens.map((s) => (
                    <LTTSelectItem key={s.id} value={s.id}>
                      {s.screenNumber}
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
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
      <LTTDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa suất chiếu</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-3 text-sm text-muted-foreground-shadcn">Bạn có chắc chắn muốn xóa suất chiếu này?</div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setSingleDeleteOpen(false)}>Hủy</LTTButton>
            <LTTButton
              variant="destructive"
              onClick={async () => {
                await deleteMutation.mutation(singleDeleteId);
                setSingleDeleteOpen(false);
                toast.success("Đã xóa suất chiếu");
                fetchData();
              }}
            >
              Xóa
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}

