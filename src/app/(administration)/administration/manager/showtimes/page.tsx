"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CircleAlert, Info, List, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getCookie } from "@/src/@core/utils/cookie";
import { getUserInfoFromToken } from "@/src/@core/utils/jwt";
import { ADMIN_ACCESS_TOKEN_KEY } from "@/src/@core/const";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { cn } from "@/src/@core/utils/cn";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { showtimeService } from "@/src/services/administration-service/showtime/showtime.service";
import { CreateShowtimeInputDto } from "@/src/services/administration-service/showtime/models/input.model";
import { ShowtimeOutputDto } from "@/src/services/administration-service/showtime/models/output.model";
import { movieService } from "@/src/services/administration-service/movie/movie.service";
import { MovieDistributionOutputDto, MovieOutputDto } from "@/src/services/administration-service/movie/models/output.model";
import { FormatOutputDto } from "@/src/services/administration-service/movie/format/models/output.model";
import { screenService } from "@/src/services/administration-service/screen/screen.service";
import { ScreenOutputDto } from "@/src/services/administration-service/screen/models/output.model";
import { cinemaService } from "@/src/services/administration-service/cinema/cinema.service";
import { managerPricingRulesService } from "@/src/services/administration-service/manager/pricing-rules/pricing-rules.service";
import { PricingRuleOutputDto } from "@/src/services/administration-service/pricing-rule/models/output.model";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import {
  LTTDialog,
  LTTDialogContent,
  LTTDialogFooter,
  LTTDialogHeader,
  LTTDialogTitle,
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
import { LTTTabs, LTTTabsList, LTTTabsTrigger } from "@/src/@core/component/LTTShadcnUI/LTTTabs";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

type MainTab = "scheduler" | "distribution";
type SchedulerView = "table" | "calendar";

type ShowtimeFormState = {
  movieId: string;
  cinemaId: string;
  screenId: string;
  movieDistributionId: string;
  date: string;
  startTime: string;
  endTime: string;
  format: string;
  language: string;
  caption: string;
  basePrice: string;
};

const statusColor: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  started: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ended: "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
};

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8);
const DAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
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
const extractTime = (value?: string) => {
  if (!value) return "";
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) return value.slice(0, 5);
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
};
const toTimeInput = (value: string) => extractTime(value);
const getWeekDates = (baseDate: Date): Date[] => {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day === 0 ? 7 : day) - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};
const formatDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const normalizeDateString = (value?: string) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (value.includes("T")) return value.split("T")[0];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return formatDateKey(parsed);
};
const toDayStartMs = (value?: string) => {
  const normalized = normalizeDateString(value);
  if (!normalized) return Number.NaN;
  const ms = new Date(`${normalized}T00:00:00`).getTime();
  return Number.isNaN(ms) ? Number.NaN : ms;
};
const isDistributionValidForDate = (item: MovieDistributionOutputDto, dateValue: string) => {
  const target = toDayStartMs(dateValue);
  if (Number.isNaN(target)) return false;
  const start = item.licenseStartDate ? toDayStartMs(item.licenseStartDate) : Number.NEGATIVE_INFINITY;
  const end = item.licenseEndDate ? toDayStartMs(item.licenseEndDate) : Number.POSITIVE_INFINITY;
  return target >= start && target <= end;
};
const isDistributionNotExpired = (item: MovieDistributionOutputDto) => {
  const today = toDayStartMs(toDateInput(new Date()));
  if (Number.isNaN(today)) return false;
  const end = item.licenseEndDate ? toDayStartMs(item.licenseEndDate) : Number.POSITIVE_INFINITY;
  return today <= end;
};
const extractDate = (item: ShowtimeOutputDto) => {
  if (item.showDate) return normalizeDateString(item.showDate);
  if (item.date) return normalizeDateString(item.date);
  if (item.startTime?.includes("T")) return normalizeDateString(item.startTime);
  return "";
};
const resolveFormatLabel = (item: ShowtimeOutputDto) => {
  const raw = ((item as unknown as { movieFormat?: string }).movieFormat || item.format || "").trim();
  if (!raw) return "-";
  try {
    const parsed = JSON.parse(raw) as { movie_format?: string; movie_language?: string; movie_caption?: string };
    return parsed.movie_format || item.format || "-";
  } catch {
    return item.format || raw || "-";
  }
};
const resolveShowtimeStatus = (item: ShowtimeOutputDto): "scheduled" | "started" | "ended" => {
  const date = extractDate(item);
  const start = extractTime(item.startTime);
  const end = extractTime(item.endTime);
  if (!date || !start || !end) return "scheduled";

  const startAt = new Date(`${date}T${start}:00`);
  const endAt = new Date(`${date}T${end}:00`);
  const now = new Date();

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) return "scheduled";
  if (now < startAt) return "scheduled";
  if (now > endAt) return "ended";
  return "started";
};
const addMinutes = (hhmm: string, mins: number) => {
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const total = h * 60 + m + mins;
  const normalized = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mm = String(normalized % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};
const formatPrice = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

export default function ShowtimeSchedulerPage() {
  const { t } = useLocalization();
  const [mainTab, setMainTab] = useState<MainTab>("scheduler");
  const [viewMode, setViewMode] = useState<SchedulerView>("table");
  const [managerCinemaId, setManagerCinemaId] = useState("");

  const [movies, setMovies] = useState<MovieOutputDto[]>([]);
  const [schedulerDistributions, setSchedulerDistributions] = useState<MovieDistributionOutputDto[]>([]);
  const [showtimes, setShowtimes] = useState<ShowtimeOutputDto[]>([]);
  const [showtimeTotal, setShowtimeTotal] = useState(0);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(toDateInput(new Date()));
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [calendarWeek, setCalendarWeek] = useState(new Date());

  const [distSearch, setDistSearch] = useState("");
  const [distributionItems, setDistributionItems] = useState<MovieDistributionOutputDto[]>([]);
  const [distributionTotal, setDistributionTotal] = useState(0);
  const [distPage, setDistPage] = useState(1);
  const [distFetch, setDistFetch] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState("");
  const [editing, setEditing] = useState<ShowtimeOutputDto | null>(null);
  const [endTimeManuallyEdited, setEndTimeManuallyEdited] = useState(false);

  const [dialogScreens, setDialogScreens] = useState<ScreenOutputDto[]>([]);
  const [screenOptions, setScreenOptions] = useState<ScreenOutputDto[]>([]);
  const [dialogFormats, setDialogFormats] = useState<FormatOutputDto[]>([]);
  const [dialogDistributions, setDialogDistributions] = useState<MovieDistributionOutputDto[]>([]);
  const [dialogPricingRules, setDialogPricingRules] = useState<PricingRuleOutputDto[]>([]);

  const [form, setForm] = useState<ShowtimeFormState>({
    movieId: "",
    cinemaId: "",
    screenId: "",
    movieDistributionId: "",
    date: toDateInput(new Date()),
    startTime: "",
    endTime: "",
    format: "",
    language: "Vietnamese",
    caption: "Vietsub",
    basePrice: "",
  });

  const eligibleSchedulerDistributions = useMemo(
    () => schedulerDistributions.filter((item) => isDistributionNotExpired(item)),
    [schedulerDistributions]
  );
  const eligibleMovies = useMemo(
    () => {
      const distributedMovieIds = new Set(eligibleSchedulerDistributions.map((item) => item.movieId));
      return movies.filter((movie) => distributedMovieIds.has(movie.id));
    },
    [movies, eligibleSchedulerDistributions]
  );
  const effectiveMovieId = eligibleMovies.some((movie) => movie.id === selectedMovieId)
    ? selectedMovieId
    : (eligibleMovies[0]?.id || "");
  const selectedMovie = useMemo(
    () => movies.find((movie) => movie.id === form.movieId),
    [movies, form.movieId]
  );
  const selectedDistribution = useMemo(
    () => dialogDistributions.find((distribution) => distribution.id === form.movieDistributionId),
    [dialogDistributions, form.movieDistributionId]
  );
  const availableFormDistributions = useMemo(
    () =>
      dialogDistributions.filter(
        (distribution) =>
          distribution.movieId === form.movieId &&
          isDistributionValidForDate(distribution, form.date || toDateInput(new Date()))
      ),
    [dialogDistributions, form.movieId, form.date]
  );

  const listShowtimeMutation = useLTTMutation<
    PagedResultDto<ShowtimeOutputDto> | undefined,
    { movieId: string; cinemaId: string; page: number; fetch: number }
  >({
    mutationFn: (params) => showtimeService.getShowtimeListAsync(params),
    onSuccess: (res) => {
      setShowtimes(res?.items || []);
      setShowtimeTotal(res?.totalCount || 0);
    },
    onError: (err) => toast.error(err.message || t("admin.showtimes.fetch_error")),
  });

  const movieMutation = useLTTMutation<PagedResultDto<MovieOutputDto> | undefined, void>({
    mutationFn: () => movieService.getMovieListAsync({ page: 1, fetch: 100 }),
    onSuccess: (res) => setMovies(res?.items || []),
    onError: (err) => toast.error(err.message || t("admin.showtimes.fetch_error")),
  });

  const listDistributionMutation = useLTTMutation<PagedResultDto<MovieDistributionOutputDto> | undefined, void>({
    mutationFn: () => movieService.getDistributionsAsync({ skipCount: (distPage - 1) * distFetch, maxResultCount: distFetch }),
    onSuccess: (res) => {
      const q = distSearch.trim().toLowerCase();
      const list = res?.items || [];
      const filtered = q ? list.filter((item) => item.movieTitle.toLowerCase().includes(q)) : list;
      setDistributionItems(filtered);
      setDistributionTotal(res?.totalCount || filtered.length);
    },
    onError: (err) => toast.error(err.message || t("admin.showtimes.distribution_fetch_error")),
  });

  const schedulerDistributionMutation = useLTTMutation<PagedResultDto<MovieDistributionOutputDto> | undefined, void>({
    mutationFn: () => movieService.getDistributionsAsync({ skipCount: 0, maxResultCount: 1000 }),
    onSuccess: (res) => setSchedulerDistributions(res?.items || []),
    onError: (err) => toast.error(err.message || t("admin.showtimes.distribution_fetch_error")),
  });

  const screenLookupMutation = useLTTMutation<PagedResultDto<ScreenOutputDto> | undefined, void>({
    mutationFn: () => {
      if (!managerCinemaId) return Promise.resolve(undefined);
      return screenService.getScreenListAsync(managerCinemaId, { page: 1, fetch: 200 });
    },
    onSuccess: (res) => setScreenOptions(res?.items || []),
    onError: () => setScreenOptions([]),
  });

  const loadDialogContextMutation = useLTTMutation<void, void>({
    mutationFn: async () => {
      if (!managerCinemaId) return;

      const [screensRes, formatsRes, distributionsRes, pricingRulesRes] = await Promise.all([
        screenService.getScreenListAsync(managerCinemaId, { page: 1, fetch: 100 }),
        movieService.getFormats({ page: 1, fetch: 100 }),
        movieService.getDistributionsAsync({ skipCount: 0, maxResultCount: 1000 }),
        managerPricingRulesService.getPricingRuleListAsync(managerCinemaId, 1, 100),
      ]);

      setDialogScreens(screensRes.items || []);
      setDialogFormats(formatsRes.items || []);
      setDialogDistributions(distributionsRes.items || []);
      setDialogPricingRules(pricingRulesRes.items || []);
      setForm((current) => {
        const next = { ...current };
        if (!next.format && formatsRes.items?.length) {
          next.format = formatsRes.items[0].name;
        }
        if (next.movieId && !next.movieDistributionId) {
          const distribution = (distributionsRes.items || []).find(
            (item) => item.movieId === next.movieId && isDistributionValidForDate(item, next.date || toDateInput(new Date()))
          );
          next.movieDistributionId = distribution?.id || "";
        }
        return next;
      });
    },
    onError: (err) => toast.error(err.message || t("admin.showtimes.form.context_load_error")),
  });

  const createShowtimeMutation = useLTTMutation<ShowtimeOutputDto | undefined, CreateShowtimeInputDto>({
    mutationFn: (body) => showtimeService.createShowtimeAsync(body),
    onSuccess: () => {
      toast.success(t("admin.showtimes.create_success"));
      setDialogOpen(false);
      fetchShowtimes();
    },
    onError: (err) => toast.error(err.message || t("admin.showtimes.create_error")),
  });

  const updateShowtimeMutation = useLTTMutation<ShowtimeOutputDto | undefined, { id: string; body: CreateShowtimeInputDto }>({
    mutationFn: ({ id, body }) => showtimeService.updateShowtimeAsync(id, body),
    onSuccess: () => {
      toast.success(t("admin.showtimes.update_success"));
      setDialogOpen(false);
      fetchShowtimes();
    },
    onError: (err) => toast.error(err.message || t("admin.showtimes.update_error")),
  });

  const deleteShowtimeMutation = useLTTMutation<void, string>({
    mutationFn: (id) => showtimeService.deleteShowtimeAsync(id),
    onSuccess: () => {
      toast.success(t("admin.showtimes.delete_success"));
      fetchShowtimes();
    },
    onError: (err) => toast.error(err.message || t("admin.showtimes.delete_error")),
  });

  const fetchShowtimes = () => {
    if (!managerCinemaId || !effectiveMovieId) return;
    listShowtimeMutation.mutation({
      movieId: effectiveMovieId,
      cinemaId: managerCinemaId,
      page,
      fetch,
    });
  };

  useEffect(() => {
    let isCancelled = false;

    const resolveManagerCinemaAsync = async () => {
      const accessToken = getCookie(ADMIN_ACCESS_TOKEN_KEY);
      const userInfo = accessToken ? getUserInfoFromToken(accessToken) : null;
      const claimCinemaId = userInfo?.cinemaId?.trim() || "";

      if (claimCinemaId) {
        if (!isCancelled) {
          setManagerCinemaId(claimCinemaId);
        }
        return;
      }

      try {
        const cinemaResult = await cinemaService.getCinemaListAsync({ page: 1, fetch: 1 });
        const fallbackCinemaId = cinemaResult?.items?.[0]?.id?.trim() || "";
        if (!fallbackCinemaId) {
          toast.error(t("admin.showtimes.cinema_claim_missing"));
          return;
        }

        if (!isCancelled) {
          setManagerCinemaId(fallbackCinemaId);
        }
      } catch {
        if (!isCancelled) {
          toast.error(t("admin.showtimes.cinema_claim_missing"));
        }
      }
    };

    resolveManagerCinemaAsync();
    return () => {
      isCancelled = true;
    };
  }, [t]);

  useEffect(() => {
    movieMutation.mutation();
    schedulerDistributionMutation.mutation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!managerCinemaId || !effectiveMovieId || mainTab !== "scheduler") return;
    fetchShowtimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerCinemaId, effectiveMovieId, page, fetch, mainTab]);

  useEffect(() => {
    if (mainTab !== "distribution") return;
    listDistributionMutation.mutation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab, distPage, distFetch, distSearch]);

  useEffect(() => {
    if (!dialogOpen || !managerCinemaId) return;
    loadDialogContextMutation.mutation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen, managerCinemaId]);

  useEffect(() => {
    if (!managerCinemaId) return;
    screenLookupMutation.mutation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerCinemaId]);

  useEffect(() => {
    if (!dialogOpen || !form.movieId) return;
    const selectedStillValid = availableFormDistributions.some((item) => item.id === form.movieDistributionId);
    if (selectedStillValid) return;
    setForm((current) => ({
      ...current,
      movieDistributionId: availableFormDistributions[0]?.id || "",
    }));
  }, [dialogOpen, form.movieId, form.movieDistributionId, availableFormDistributions]);

  const filteredShowtimes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return showtimes.filter((item) => {
      const matchSearch = !q || (item.movieTitle || "").toLowerCase().includes(q);
      const matchDate = !dateFilter || extractDate(item) === dateFilter;
      return matchSearch && matchDate;
    });
  }, [showtimes, search, dateFilter]);

  const weekDates = useMemo(() => getWeekDates(calendarWeek), [calendarWeek]);
  const todayKey = formatDateKey(new Date());
  const movieColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const uniqueMovies = [...new Set(filteredShowtimes.map((item) => item.movieId))];
    uniqueMovies.forEach((id, idx) => {
      map[id] = MOVIE_COLORS[idx % MOVIE_COLORS.length];
    });
    return map;
  }, [filteredShowtimes]);
  const calendarItems = useMemo(() => {
    const weekKeys = weekDates.map(formatDateKey);
    return filteredShowtimes.filter((item) => weekKeys.includes(extractDate(item)));
  }, [filteredShowtimes, weekDates]);
  const shiftWeek = (dir: number) => {
    const d = new Date(calendarWeek);
    d.setDate(d.getDate() + dir * 7);
    setCalendarWeek(d);
  };
  const goToday = () => setCalendarWeek(new Date());

  useEffect(() => {
    if (viewMode !== "calendar") return;
    if (calendarItems.length > 0) return;
    const firstDate = filteredShowtimes[0] ? extractDate(filteredShowtimes[0]) : "";
    if (!firstDate) return;
    const parsed = new Date(firstDate);
    if (Number.isNaN(parsed.getTime())) return;
    setCalendarWeek(parsed);
  }, [viewMode, calendarItems.length, filteredShowtimes]);

  const openCreate = (prefillDate?: string, prefillTime?: string) => {
    const defaultMovie = selectedMovieId || eligibleMovies[0]?.id || "";
    const showDate = prefillDate || toDateInput(new Date());
    const defaultDistribution =
      dialogDistributions.find((item) => item.movieId === defaultMovie && isDistributionValidForDate(item, showDate))?.id || "";
    setEditing(null);
    setEndTimeManuallyEdited(false);
    setForm({
      movieId: defaultMovie,
      cinemaId: managerCinemaId,
      screenId: "",
      movieDistributionId: defaultDistribution,
      date: showDate,
      startTime: prefillTime || "",
      endTime: "",
      format: dialogFormats[0]?.name || "",
      language: "Vietnamese",
      caption: "Vietsub",
      basePrice: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: ShowtimeOutputDto) => {
    const formatPayload = item.format || "2D";
    setEditing(item);
    setEndTimeManuallyEdited(true);
    setForm({
      movieId: item.movieId,
      cinemaId: managerCinemaId,
      screenId: item.screenId,
      movieDistributionId: item.distributionId || "",
      date: extractDate(item) || toDateInput(new Date()),
      startTime: toTimeInput(item.startTime),
      endTime: toTimeInput(item.endTime),
      format: formatPayload,
      language: "Vietnamese",
      caption: "Vietsub",
      basePrice: String(item.basePrice || ""),
    });
    setDialogOpen(true);
  };

  const saveShowtime = () => {
    if (!form.movieId || !form.cinemaId || !form.screenId || !form.movieDistributionId || !form.date || !form.startTime || !form.endTime) {
      toast.error(t("admin.showtimes.form.validation.required"));
      return;
    }

    const basePrice = Number(form.basePrice);
    if (!basePrice || basePrice <= 0) {
      toast.error(t("admin.showtimes.form.validation.base_price_invalid"));
      return;
    }

    if (!selectedDistribution || !isDistributionValidForDate(selectedDistribution, form.date)) {
      toast.error(t("admin.showtimes.form.validation.distribution_invalid_for_show_date"));
      return;
    }

    const body: CreateShowtimeInputDto = {
      movieId: form.movieId,
      cinemaId: form.cinemaId,
      screenId: form.screenId,
      distributionId: form.movieDistributionId,
      showDate: form.date,
      startTime: `${form.startTime}:00`,
      endTime: `${form.endTime}:00`,
      duration: selectedMovie?.durationMins || undefined,
      basePrice,
      movieFormat: JSON.stringify({
        movie_format: form.format || "2D",
        movie_language: form.language || "Vietnamese",
        movie_caption: form.caption || "Vietsub",
      }),
    };

    if (editing?.id) {
      updateShowtimeMutation.mutation({ id: editing.id, body });
      return;
    }

    createShowtimeMutation.mutation(body);
  };

  const distributionStatus = (item: MovieDistributionOutputDto) => {
    const now = new Date().getTime();
    const start = item.licenseStartDate ? new Date(item.licenseStartDate).getTime() : Number.NEGATIVE_INFINITY;
    const end = item.licenseEndDate ? new Date(item.licenseEndDate).getTime() : Number.POSITIVE_INFINITY;
    if (now < start) return t("admin.showtimes.distribution.status.upcoming");
    if (now > end) return t("admin.showtimes.distribution.status.expired");
    return t("admin.showtimes.distribution.status.active");
  };
  const isLikelyGuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  const resolveScreenLabel = (item: ShowtimeOutputDto) => {
    const name = (item.screenName || "").trim();
    if (name && !isLikelyGuid(name)) return name;
    const found = screenOptions.find((screen) => screen.id === item.screenId);
    if (found) return `Screen ${found.screenNumber}`;
    return name || item.screenId;
  };
  const resolveDurationMinutes = (item: ShowtimeOutputDto) => {
    const payloadDuration = (item as unknown as { duration?: number }).duration;
    if (typeof payloadDuration === "number" && payloadDuration > 0) return payloadDuration;
    const start = timeToMinutes(extractTime(item.startTime));
    const end = timeToMinutes(extractTime(item.endTime));
    if (Number.isNaN(start) || Number.isNaN(end)) return 0;
    const diff = end >= start ? end - start : 24 * 60 - start + end;
    return diff;
  };
  const resolveUpdatedAt = (item: ShowtimeOutputDto) => {
    const raw = (item as unknown as { updatedAt?: string; lastModificationTime?: string }).updatedAt
      || (item as unknown as { updatedAt?: string; lastModificationTime?: string }).lastModificationTime;
    if (!raw) return "--";
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleString();
  };

  const schedulerLoading = listShowtimeMutation.isLoading || deleteShowtimeMutation.isLoading;
  const saveLoading = createShowtimeMutation.isLoading || updateShowtimeMutation.isLoading;
  const contextLoading = loadDialogContextMutation.isLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.showtimes.title")}</h1>
        <div className="flex items-center gap-3">
          {mainTab === "scheduler" && (
            <>
              <LTTTabs value={viewMode} onValueChange={(value) => setViewMode(value as SchedulerView)}>
                <LTTTabsList className="h-9">
                  <LTTTabsTrigger value="table" className="gap-1.5 px-3 text-xs">
                    <List className="h-3.5 w-3.5" /> {t("admin.showtimes.view.table")}
                  </LTTTabsTrigger>
                  <LTTTabsTrigger value="calendar" className="gap-1.5 px-3 text-xs">
                    <CalendarDays className="h-3.5 w-3.5" /> {t("admin.showtimes.view.calendar")}
                  </LTTTabsTrigger>
                </LTTTabsList>
              </LTTTabs>
              <LTTButton onClick={() => openCreate()} className="gap-2" disabled={!managerCinemaId}>
                <Plus className="h-4 w-4" /> {t("admin.showtimes.add")}
              </LTTButton>
            </>
          )}
        </div>
      </div>

      {mainTab === "scheduler" ? (
        <>
            <LTTTabs value={mainTab} onValueChange={(value) => setMainTab(value as MainTab)}>
                <LTTTabsList className="h-9">
                    <LTTTabsTrigger value="scheduler" className="px-3 text-xs">{t("admin.showtimes.tabs.scheduler")}</LTTTabsTrigger>
                    <LTTTabsTrigger value="distribution" className="px-3 text-xs">{t("admin.showtimes.tabs.distribution")}</LTTTabsTrigger>
                </LTTTabsList>
            </LTTTabs>
          <div className="flex items-center gap-3 flex-wrap my-2">
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
            <LTTSelect value={effectiveMovieId} onValueChange={(value) => { setSelectedMovieId(value); setPage(1); }}>
              <LTTSelectTrigger className="w-72">
                <LTTSelectValue placeholder={t("admin.showtimes.movie_filter_placeholder")} />
              </LTTSelectTrigger>
              <LTTSelectContent>
                {eligibleMovies.map((movie) => (
                  <LTTSelectItem key={movie.id} value={movie.id}>{movie.title}</LTTSelectItem>
                ))}
              </LTTSelectContent>
            </LTTSelect>
            <LTTButton type="button" variant="outline" className="gap-2" onClick={fetchShowtimes} loading={listShowtimeMutation.isLoading}>
              <RefreshCw className="h-4 w-4" /> {t("admin.showtimes.refresh")}
            </LTTButton>
          </div>

          {viewMode === "table" ? (
            <>
              <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                      <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.table.screen")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.table.show_date")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.table.time")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.table.format")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.table.base_price")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.table.status")}</th>
                      <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.table.updated_at")}</th>
                      <th className="px-4 py-3 text-right font-semibold">{t("admin.showtimes.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedulerLoading ? (
                      <DomainTableStateRow colSpan={8} state="loading" loadingText={t("admin.showtimes.loading")} />
                    ) : filteredShowtimes.length === 0 ? (
                      <DomainTableStateRow colSpan={8} state="empty" emptyText={t("admin.showtimes.empty")} />
                    ) : (
                      filteredShowtimes.map((item) => (
                        <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                          <td className="px-4 py-3">{resolveScreenLabel(item)}</td>
                          <td className="px-4 py-3">{extractDate(item)}</td>
                          <td className="px-4 py-3">
                            {toTimeInput(item.startTime)} - {toTimeInput(item.endTime)} ({resolveDurationMinutes(item)}m)
                          </td>
                          <td className="px-4 py-3">{resolveFormatLabel(item)}</td>
                          <td className="px-4 py-3">{formatPrice(item.basePrice || 0)}</td>
                          <td className="px-4 py-3">
                            <LTTBadge className={cn("font-medium", statusColor[resolveShowtimeStatus(item)] || statusColor.scheduled)}>
                              {t(`admin.showtimes.status.${resolveShowtimeStatus(item)}`)}
                            </LTTBadge>
                          </td>
                          <td className="px-4 py-3">{resolveUpdatedAt(item)}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
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
              <AdminTablePagination
                totalCount={showtimeTotal}
                page={page}
                pageSize={fetch}
                onPageChange={(nextPage) => setPage(nextPage)}
                onPageSizeChange={(nextSize) => {
                  setFetch(nextSize);
                  setPage(1);
                }}
                loading={listShowtimeMutation.isLoading}
              />
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LTTButton variant="outline" size="icon" className="h-8 w-8" onClick={() => shiftWeek(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </LTTButton>
                  <LTTButton variant="outline" size="sm" onClick={goToday} className="text-xs">
                    {t("admin.showtimes.calendar.today")}
                  </LTTButton>
                  <LTTButton variant="outline" size="icon" className="h-8 w-8" onClick={() => shiftWeek(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </LTTButton>
                </div>
                <span className="text-sm font-medium text-muted-foreground-shadcn">
                  {weekDates[0].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} -{" "}
                  {weekDates[6].toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[...new Set(calendarItems.map((item) => item.movieId))].map((movieId) => {
                  const movie = movies.find((m) => m.id === movieId);
                  return (
                    <span
                      key={movieId}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                        movieColorMap[movieId] || "bg-muted-shadcn text-foreground-shadcn border-border-shadcn"
                      )}
                    >
                      {movie?.title || movieId}
                    </span>
                  );
                })}
              </div>

              {calendarItems.length === 0 ? (
                <div className="rounded-lg border border-border-shadcn bg-card p-4 text-sm text-muted-foreground-shadcn">
                  {t("admin.showtimes.empty")}
                </div>
              ) : (
                <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border-shadcn bg-muted-shadcn/50">
                        <div className="px-2 py-2 text-xs font-medium text-muted-foreground-shadcn text-center">
                          {t("admin.showtimes.calendar.hour")}
                        </div>
                        {weekDates.map((d, i) => {
                          const key = formatDateKey(d);
                          const isToday = key === todayKey;
                          return (
                            <div key={i} className={cn("px-2 py-2 text-center border-l border-border-shadcn", isToday && "bg-primary/10")}>
                              <div className="text-xs text-muted-foreground-shadcn">{DAYS_VI[(i + 1) % 7 === 0 ? 0 : i + 1]}</div>
                              <div className={cn("text-sm font-semibold", isToday && "text-primary")}>
                                {d.getDate()}/{d.getMonth() + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="relative">
                        {HOURS.map((hour) => (
                          <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border-shadcn last:border-0">
                            <div className="px-2 py-3 text-xs text-muted-foreground-shadcn text-center border-r border-border-shadcn">
                              {String(hour).padStart(2, "0")}:00
                            </div>
                            {weekDates.map((d, dayIndex) => {
                              const dateKey = formatDateKey(d);
                              const isToday = dateKey === todayKey;
                              const showtimesInSlot = calendarItems.filter((item) => {
                                const itemDate = extractDate(item);
                                if (itemDate !== dateKey) return false;
                                const startMinutes = timeToMinutes(toTimeInput(item.startTime));
                                const slotStart = hour * 60;
                                return startMinutes >= slotStart && startMinutes < slotStart + 60;
                              });

                              return (
                                <div
                                  key={dayIndex}
                                  className={cn(
                                    "relative border-l border-border-shadcn min-h-[52px] cursor-pointer hover:bg-muted-shadcn/20 transition-colors",
                                    isToday && "bg-primary/5"
                                  )}
                                  onClick={() => openCreate(dateKey, `${String(hour).padStart(2, "0")}:00`)}
                                >
                                  {showtimesInSlot.map((item) => {
                                    const startMinutes = timeToMinutes(toTimeInput(item.startTime));
                                    const endMinutes = timeToMinutes(toTimeInput(item.endTime));
                                    const durationMinutes = Math.max(endMinutes - startMinutes, 30);
                                    const topOffset = ((startMinutes - hour * 60) / 60) * 100;
                                    const heightPercent = (durationMinutes / 60) * 100;

                                    return (
                                      <div
                                        key={item.id}
                                        className={cn(
                                          "absolute left-0.5 right-0.5 rounded border px-1 py-0.5 overflow-hidden cursor-pointer z-10",
                                          movieColorMap[item.movieId] || "bg-slate-500/80 border-slate-600 text-white",
                                          resolveShowtimeStatus(item) === "ended" && "opacity-70"
                                        )}
                                        style={{ top: `${topOffset}%`, height: `${Math.max(heightPercent, 40)}%`, minHeight: "20px" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEdit(item);
                                        }}
                                        title={`${item.movieTitle}\n${toTimeInput(item.startTime)} - ${toTimeInput(item.endTime)}\n${item.screenName || item.screenId}`}
                                      >
                                        <div className="text-[10px] font-bold leading-tight truncate">{item.movieTitle}</div>
                                        <div className="text-[9px] opacity-90 leading-tight">
                                          {toTimeInput(item.startTime)}-{toTimeInput(item.endTime)} ({resolveDurationMinutes(item)}m) • {resolveScreenLabel(item)}
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
              )}
            </div>
          )}
        </>
      ) : (
        <>
            <LTTTabs value={mainTab} onValueChange={(value) => setMainTab(value as MainTab)}>
                <LTTTabsList className="h-9">
                    <LTTTabsTrigger value="scheduler" className="px-3 text-xs">{t("admin.showtimes.tabs.scheduler")}</LTTTabsTrigger>
                    <LTTTabsTrigger value="distribution" className="px-3 text-xs">{t("admin.showtimes.tabs.distribution")}</LTTTabsTrigger>
                </LTTTabsList>
            </LTTTabs>
          <div className="flex items-center gap-3 flex-wrap my-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
              <LTTInput
                value={distSearch}
                onChange={(e) => {
                  setDistSearch(e.target.value);
                  setDistPage(1);
                }}
                placeholder={t("admin.showtimes.distribution.search_placeholder")}
                className="pl-9"
              />
            </div>
            <LTTButton variant="outline" className="gap-2" onClick={() => listDistributionMutation.mutation()} loading={listDistributionMutation.isLoading}>
              <RefreshCw className="h-4 w-4" /> {t("admin.showtimes.refresh")}
            </LTTButton>
          </div>
          <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                  <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.distribution.table.movie")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.distribution.table.date_range")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.distribution.table.exclusive")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.distribution.table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {listDistributionMutation.isLoading ? (
                  <DomainTableStateRow colSpan={4} state="loading" loadingText={t("admin.showtimes.distribution.loading")} />
                ) : distributionItems.length === 0 ? (
                  <DomainTableStateRow colSpan={4} state="empty" emptyText={t("admin.showtimes.distribution.empty")} />
                ) : (
                  distributionItems.map((item) => (
                    <tr key={item.id} className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{item.movieTitle}</td>
                      <td className="px-4 py-3">
                        {(item.licenseStartDate || "---").split("T")[0]} - {(item.licenseEndDate || "---").split("T")[0]}
                      </td>
                      <td className="px-4 py-3">
                        <LTTBadge className={item.isExclusive ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}>
                          {item.isExclusive ? t("admin.showtimes.distribution.exclusive") : t("admin.showtimes.distribution.standard")}
                        </LTTBadge>
                      </td>
                      <td className="px-4 py-3">{distributionStatus(item)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <AdminTablePagination
            totalCount={distributionTotal}
            page={distPage}
            pageSize={distFetch}
            onPageChange={(nextPage) => setDistPage(nextPage)}
            onPageSizeChange={(nextSize) => {
              setDistFetch(nextSize);
              setDistPage(1);
            }}
            loading={listDistributionMutation.isLoading}
          />
        </>
      )}

      <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LTTDialogContent className="sm:max-w-2xl">
          <LTTDialogHeader>
            <LTTDialogTitle>{editing ? t("admin.showtimes.edit_title") : t("admin.showtimes.add_title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <LTTLabel>{t("admin.showtimes.form.movie")}</LTTLabel>
              <LTTSelect
                value={form.movieId}
                onValueChange={(value) => {
                  const distribution = dialogDistributions.find(
                    (item) => item.movieId === value && isDistributionValidForDate(item, form.date || toDateInput(new Date()))
                  );
                  const movie = movies.find((item) => item.id === value);
                  const autoEnd =
                    !endTimeManuallyEdited && form.startTime
                      ? addMinutes(form.startTime, (movie?.durationMins || 120) + 10)
                      : form.endTime;
                  setEndTimeManuallyEdited(false);
                  setForm((current) => ({
                    ...current,
                    movieId: value,
                    movieDistributionId: distribution?.id || "",
                    endTime: autoEnd,
                  }));
                }}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder={t("admin.showtimes.form.movie_placeholder")} />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {eligibleMovies.map((movie) => (
                    <LTTSelectItem key={movie.id} value={movie.id}>{movie.title}</LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>

            <div className="space-y-2">
              <LTTLabel>{t("admin.showtimes.form.screen")}</LTTLabel>
              <LTTSelect value={form.screenId} onValueChange={(value) => setForm((current) => ({ ...current, screenId: value }))}>
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder={contextLoading ? t("admin.showtimes.form.loading_screens") : t("admin.showtimes.form.screen_placeholder")} />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {dialogScreens.map((screen) => (
                    <LTTSelectItem key={screen.id} value={screen.id}>
                      Screen {screen.screenNumber} ({screen.screenType})
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>

            <div className="space-y-2">
              <LTTLabel>{t("admin.showtimes.form.show_date")}</LTTLabel>
              <LTTInput
                type="date"
                value={form.date}
                onChange={(e) => {
                  const nextDate = e.target.value;
                  setForm((current) => {
                    const nextDistributions = dialogDistributions.filter(
                      (item) => item.movieId === current.movieId && isDistributionValidForDate(item, nextDate)
                    );
                    const nextDistributionId = nextDistributions.some((item) => item.id === current.movieDistributionId)
                      ? current.movieDistributionId
                      : (nextDistributions[0]?.id || "");
                    return {
                      ...current,
                      date: nextDate,
                      movieDistributionId: nextDistributionId,
                    };
                  });
                }}
              />
              {selectedDistribution && (
                <p className="text-xs text-muted-foreground-shadcn">
                  {t("admin.showtimes.form.distribution_window")}: {(selectedDistribution.licenseStartDate || "---").split("T")[0]} - {(selectedDistribution.licenseEndDate || "---").split("T")[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <LTTLabel>{t("admin.showtimes.form.format")}</LTTLabel>
              <LTTSelect value={form.format} onValueChange={(value) => setForm((current) => ({ ...current, format: value }))}>
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder={contextLoading ? t("admin.showtimes.form.loading_formats") : t("admin.showtimes.form.select_format")} />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {dialogFormats.map((format) => (
                    <LTTSelectItem key={format.id} value={format.name}>{format.name}</LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>

            <div className="space-y-2">
              <LTTLabel>{t("admin.showtimes.form.start_time")}</LTTLabel>
              <LTTInput
                type="time"
                value={form.startTime}
                onChange={(e) => {
                  const nextStartTime = e.target.value;
                  const autoEnd =
                    !endTimeManuallyEdited
                      ? addMinutes(nextStartTime, (selectedMovie?.durationMins || 120) + 10)
                      : form.endTime;
                  setEndTimeManuallyEdited(false);
                  setForm((current) => ({ ...current, startTime: nextStartTime, endTime: autoEnd }));
                }}
              />
            </div>

            <div className="space-y-2">
              <LTTLabel>{t("admin.showtimes.form.end_time")}</LTTLabel>
              <LTTInput
                type="time"
                value={form.endTime}
                onChange={(e) => {
                  setEndTimeManuallyEdited(true);
                  setForm((current) => ({ ...current, endTime: e.target.value }));
                }}
              />
            </div>

            <div className="space-y-2">
              <LTTLabel>{t("admin.showtimes.form.language")}</LTTLabel>
              <LTTInput value={form.language} onChange={(e) => setForm((current) => ({ ...current, language: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <LTTLabel>{t("admin.showtimes.form.caption")}</LTTLabel>
              <LTTInput value={form.caption} onChange={(e) => setForm((current) => ({ ...current, caption: e.target.value }))} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2">
                <LTTLabel>{t("admin.showtimes.form.base_price")}</LTTLabel>
                <button
                  type="button"
                  aria-label="Show pricing rules"
                  className="text-muted-foreground-shadcn hover:text-foreground-shadcn"
                  onClick={() => setPricingDialogOpen(true)}
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              <LTTInput
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm((current) => ({ ...current, basePrice: e.target.value }))}
                placeholder={t("admin.showtimes.form.base_price_placeholder")}
              />
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.common.delete_confirm.cancel")}</LTTButton>
            <LTTButton onClick={saveShowtime} loading={saveLoading}>
              {editing ? t("admin.showtimes.form.save_changes") : t("admin.showtimes.form.create")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <LTTDialogContent className="sm:max-w-2xl">
          <LTTDialogHeader>
            <LTTDialogTitle className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4" /> {t("admin.showtimes.pricing_reference")}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                  <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.pricing_columns.rule_type")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.pricing_columns.multiplier")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.pricing_columns.time_window")}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t("admin.showtimes.pricing_columns.days")}</th>
                </tr>
              </thead>
              <tbody>
                {dialogPricingRules.length === 0 ? (
                  <tr><td className="px-4 py-6 text-sm text-muted-foreground-shadcn" colSpan={4}>{t("admin.showtimes.pricing_empty")}</td></tr>
                ) : (
                  dialogPricingRules.map((rule) => (
                    <tr key={rule.id} className="border-b border-border-shadcn last:border-0">
                      <td className="px-4 py-3">{rule.ruleType}</td>
                      <td className="px-4 py-3">{rule.multiplier}</td>
                      <td className="px-4 py-3">{rule.startTime || "--"} - {rule.endTime || "--"}</td>
                      <td className="px-4 py-3">{(rule.daysOfWeek || []).join(", ")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.common.delete_confirm.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-3 text-sm text-muted-foreground-shadcn">{t("admin.common.delete_confirm.message")}</div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setSingleDeleteOpen(false)}>{t("admin.common.delete_confirm.cancel")}</LTTButton>
            <LTTButton
              variant="destructive"
              onClick={async () => {
                await deleteShowtimeMutation.mutation(singleDeleteId);
                setSingleDeleteOpen(false);
              }}
            >
              {t("admin.common.delete_confirm.ok")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}

