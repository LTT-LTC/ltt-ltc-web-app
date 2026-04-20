"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Search, Film, RefreshCw, Inbox, Loader2 } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
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
import {
  LTTTabs,
  LTTTabsContent,
  LTTTabsList,
  LTTTabsTrigger,
} from "@/src/@core/component/LTTShadcnUI/LTTTabs";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { movieService } from "@/src/services/administration-service/movie/movie.service";
import { MovieOutputDto, RatingOutputDto } from "@/src/services/administration-service/movie/models/output.model";
import { GenreOutputDto } from "@/src/services/administration-service/movie/genre/models/output.model";
import { StudioOutputDto } from "@/src/services/administration-service/movie/studio/models/output.model";
import { ActorOutputDto } from "@/src/services/administration-service/movie/actor/models/output.model";
import { RoleOutputDto } from "@/src/services/administration-service/movie/role/models/output.model";
import { GetMovieListInputDto, CreateMovieInputDto, UpdateMovieInputDto } from "@/src/services/administration-service/movie/models/input.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { cn } from "@/src/@core/utils/cn";

type MovieCastFormEntry = {
  actorMode: "existing" | "new";
  roleMode: "existing" | "new";
  actorId: string;
  roleId: string;
  actorName: string;
  roleName: string;
};

const createEmptyCastRow = (mode: "existing" | "new" = "new"): MovieCastFormEntry => ({
  actorMode: mode,
  roleMode: mode,
  actorId: "",
  roleId: "",
  actorName: "",
  roleName: "",
});

const buildCastRowsFromMovie = (movie: MovieOutputDto, actors: ActorOutputDto[], roles: RoleOutputDto[]): MovieCastFormEntry[] => {
  const castSources = movie.actorRoles && movie.actorRoles.length > 0
    ? movie.actorRoles.map((item) => ({ actorName: item.actorName, roleName: item.roleName }))
    : movie.cast && movie.cast.length > 0
      ? movie.cast.map((item) => ({
        actorName: item.actorName || item.actor?.name || "",
        roleName: item.roleName || item.role?.name || "",
      }))
      : [];

  if (castSources.length === 0) {
    return [createEmptyCastRow("new")];
  }

  return castSources.map((item) => {
    const matchedActor = actors.find((actor) => actor.name === item.actorName);
    const matchedRole = roles.find((role) => role.name === item.roleName);

    return {
      actorMode: matchedActor ? "existing" : "new",
      roleMode: matchedRole ? "existing" : "new",
      actorId: matchedActor?.id || "",
      roleId: matchedRole?.id || "",
      actorName: item.actorName,
      roleName: item.roleName,
    };
  });
};

const statusLabel: Record<string, string> = {
  now_showing: "Đang chiếu",
  coming_soon: "Sắp chiếu",
  ended: "Đã kết thúc",
};
const statusColor: Record<string, string> = {
  now_showing: "bg-green-100 text-green-700 border-green-200",
  coming_soon: "bg-blue-100 text-blue-700 border-blue-200",
  ended: "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
};

export default function MoviesPage() {
  const [items, setItems] = useState<MovieOutputDto[]>([]);
  const [genres, setGenres] = useState<GenreOutputDto[]>([]);
  const [studios, setStudios] = useState<StudioOutputDto[]>([]);
  const [ratings, setRatings] = useState<RatingOutputDto[]>([]);
  const [actors, setActors] = useState<ActorOutputDto[]>([]);
  const [roles, setRoles] = useState<RoleOutputDto[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingMovie, setViewingMovie] = useState<MovieOutputDto | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<MovieOutputDto | null>(null);
  const [studioMode, setStudioMode] = useState<"existing" | "new">("existing");
  const [genresLoaded, setGenresLoaded] = useState(false);
  const [studiosLoaded, setStudiosLoaded] = useState(false);
  const [ratingsLoaded, setRatingsLoaded] = useState(false);
  const [actorsLoaded, setActorsLoaded] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [metadataQueueLoading, setMetadataQueueLoading] = useState(false);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState("");
  const skipNextFetchRef = useRef(false);
  const [form, setForm] = useState({
    title: "",
    originalTitle: "",
    durationMins: 120,
    ratingId: "",
    genreListId: [] as string[],
    ratingNumber: 7,
    studioId: "",
    studioName: "",
    cast: [{ actorMode: "existing", roleMode: "existing", actorId: "", roleId: "", actorName: "", roleName: "" }] as MovieCastFormEntry[],
    status: "coming_soon",
    description: "",
    posterUrl: "",
    trailerUrl: "",
    releaseDate: "",
    premiereDate: "",
  });

  const buildFormSnapshot = (nextForm: typeof form, nextStudioMode: "existing" | "new") => {
    return JSON.stringify({ form: nextForm, studioMode: nextStudioMode });
  };

  const isDialogDirty = dialogOpen && initialFormSnapshot.length > 0 && initialFormSnapshot !== buildFormSnapshot(form, studioMode);

  const listMutation = useLTTMutation<PagedResultDto<MovieOutputDto> | undefined, GetMovieListInputDto>({
    mutationFn: (input) => movieService.getMovieListAsync(input),
    onSuccess: (res) => {
      if (res && res.items) {
        setItems(res.items);
        setTotalCount(res.totalCount ?? res.items.length);
        setError(null);
      }
    },
    onError: (err) => {
      const errorMsg = typeof err?.message === "string" && err.message.trim() ? err.message : "Lỗi tải danh sách phim";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  });

  const genresMutation = useLTTMutation<PagedResultDto<GenreOutputDto> | undefined, void>({
    mutationFn: () => movieService.getGenresAsync({ page: 1, fetch: 1000 }),
    onSuccess: (res) => {
      if (res && res.items) {
        setGenres(res.items);
        setGenresLoaded(true);
      }
    }
  });

  const studiosMutation = useLTTMutation<PagedResultDto<StudioOutputDto> | undefined, void>({
    mutationFn: () => movieService.getStudiosAsync({ page: 1, fetch: 1000 }),
    onSuccess: (res) => {
      if (res && res.items) {
        setStudios(res.items);
        setStudiosLoaded(true);
      }
    }
  });

  const ratingsMutation = useLTTMutation<PagedResultDto<RatingOutputDto> | undefined, void>({
    mutationFn: () => movieService.getRatingsAsync({ page: 1, fetch: 1000 }),
    onSuccess: (res) => {
      if (res && res.items) {
        setRatings(res.items);
        setRatingsLoaded(true);
      }
    }
  });

  const actorsMutation = useLTTMutation<PagedResultDto<ActorOutputDto> | undefined, void>({
    mutationFn: () => movieService.getActorsAsync({ page: 1, fetch: 1000 }),
    onSuccess: (res) => {
      if (res && res.items) {
        setActors(res.items);
        setActorsLoaded(true);
      }
    }
  });

  const rolesMutation = useLTTMutation<PagedResultDto<RoleOutputDto> | undefined, void>({
    mutationFn: () => movieService.getRolesAsync({ page: 1, fetch: 1000 }),
    onSuccess: (res) => {
      if (res && res.items) {
        setRoles(res.items);
        setRolesLoaded(true);
      }
    }
  });

  const createMutation = useLTTMutation<MovieOutputDto | undefined, CreateMovieInputDto>({
    mutationFn: (input) => movieService.createMovieAsync(input),
    onSuccess: () => {
      toast.success("Thêm phim thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const updateMutation = useLTTMutation<MovieOutputDto | undefined, { id: string; body: UpdateMovieInputDto }>({
    mutationFn: (input) => movieService.updateMovieAsync(input.id, input.body),
    onSuccess: () => {
      toast.success("Cập nhật phim thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const removeMutation = useLTTMutation<void, string>({
    mutationFn: (id) => movieService.deleteMovieAsync(id),
    onSuccess: () => {
      toast.success("Xóa phim thành công");
      fetchData();
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || removeMutation.isLoading;

  const fetchData = () => {
    listMutation.mutation({
      page,
      fetch,
      keyword: debouncedSearch,
      // Status filter mapping if needed
    });
  };

  const totalPages = Math.max(1, Math.ceil((totalCount || items.length) / fetch));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    skipNextFetchRef.current = page !== 1;
    setPage(1);
  }, [debouncedSearch, tab]);

  useEffect(() => {
    if (skipNextFetchRef.current && page !== 1) {
      return;
    }
    if (skipNextFetchRef.current && page === 1) {
      skipNextFetchRef.current = false;
    }
    fetchData();
  }, [page, fetch, debouncedSearch, tab]);

  const ensureGenresLoaded = () => {
    if (!genresLoaded && !genresMutation.isLoading) {
      genresMutation.mutation();
    }
  };

  const ensureStudiosLoaded = () => {
    if (!studiosLoaded && !studiosMutation.isLoading) {
      studiosMutation.mutation();
    }
  };

  const ensureActorsLoaded = () => {
    if (!actorsLoaded && !actorsMutation.isLoading) {
      actorsMutation.mutation();
    }
  };

  const ensureRatingsLoaded = () => {
    if (!ratingsLoaded && !ratingsMutation.isLoading) {
      ratingsMutation.mutation();
    }
  };

  const ensureRolesLoaded = () => {
    if (!rolesLoaded && !rolesMutation.isLoading) {
      rolesMutation.mutation();
    }
  };

  const queueMetadataFetch = async (tasks: Array<() => void>, delayMs = 300) => {
    const queuedTasks = tasks.filter(Boolean);
    if (queuedTasks.length === 0) {
      return;
    }

    setMetadataQueueLoading(true);
    try {
      for (const task of queuedTasks) {
        task();
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } finally {
      setMetadataQueueLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = items;
    if (tab !== "all") list = list.filter((m) => m.status === tab);
    return list;
  }, [items, tab]);

  const openDetails = (movie: MovieOutputDto) => {
    setViewingMovie(movie);
    setDetailsOpen(true);
  };

  const getGenreLabel = (movie: MovieOutputDto) => {
    if (movie.genreNames && movie.genreNames.length > 0) {
      return movie.genreNames.join(", ");
    }
    if (movie.genres && movie.genres.length > 0) {
      return movie.genres.map((genre) => genre.name).join(", ");
    }
    return "-";
  };

  const getRatingLabel = (movie: MovieOutputDto) => {
    if (movie.ratingName) {
      return movie.ratingName;
    }
    if (movie.ratingCode) {
      return movie.ratingCode;
    }
    if (movie.ratingId) {
      return ratings.find((rating) => rating.id === movie.ratingId)?.name || movie.ratingId;
    }
    return "-";
  };

  const toDateLabel = (value?: string) => {
    if (!value) {
      return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString("vi-VN");
  };

  const openCreate = () => {
    setEditing(null);
    const nextStudioMode: "existing" | "new" = "new";
    const nextForm: typeof form = {
      title: "",
      originalTitle: "",
      durationMins: 120,
      ratingId: "",
      genreListId: [],
      ratingNumber: 7,
      studioId: "",
      studioName: "",
      cast: [createEmptyCastRow("new")],
      status: "coming_soon",
      description: "",
      posterUrl: "",
      trailerUrl: "",
      releaseDate: "",
      premiereDate: "",
    };
    setStudioMode(nextStudioMode);
    setForm(nextForm);
    void queueMetadataFetch([
      ensureGenresLoaded,
      ensureRatingsLoaded,
    ]);
    setInitialFormSnapshot(buildFormSnapshot(nextForm, nextStudioMode));
    setDialogOpen(true);
  };

  const openEdit = (m: MovieOutputDto) => {
    setEditing(m);
    const nextStudioMode: "existing" | "new" = "existing";
    void queueMetadataFetch([
      ensureGenresLoaded,
      ensureStudiosLoaded,
      ensureActorsLoaded,
      ensureRolesLoaded,
      ensureRatingsLoaded,
    ]);
    const nextForm: typeof form = {
      title: m.title,
      originalTitle: m.originalTitle || "",
      durationMins: m.durationMins || 120,
      ratingId: m.ratingId || "",
      genreListId: m.genres?.map((genre) => genre.id) || [],
      ratingNumber: 7,
      studioId: m.studioId || "",
      studioName: m.studioName || "",
      cast: buildCastRowsFromMovie(m, actors, roles),
      status: m.status || "coming_soon",
      description: m.description || "",
      posterUrl: m.posterUrl || "",
      trailerUrl: m.trailerUrl || "",
      releaseDate: m.releaseDate ? m.releaseDate.split("T")[0] : "",
      premiereDate: m.premiereDate ? m.premiereDate.split("T")[0] : "",
    };
    setStudioMode(nextStudioMode);
    setForm(nextForm);
    setInitialFormSnapshot(buildFormSnapshot(nextForm, nextStudioMode));
    setDialogOpen(true);
  };

  const requestCloseDialog = () => {
    if (isDialogDirty) {
      setExitConfirmOpen(true);
      return;
    }
    setDialogOpen(false);
  };

  const handleSafeDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDialogOpen(true);
      return;
    }
    requestCloseDialog();
  };

  const handleConfirmExitDialog = () => {
    setExitConfirmOpen(false);
    setDialogOpen(false);
  };

  const save = () => {
    if (!form.title.trim()) {
      toast.error("Tên phim không được để trống");
      return;
    }

    if (studioMode === "new" && !form.studioName.trim()) {
      toast.error("Tên studio không được để trống");
      return;
    }

    if (studioMode === "existing" && !form.studioId) {
      toast.error("Vui lòng chọn studio");
      return;
    }

    if (!form.ratingId) {
      toast.error("Vui lòng chọn rating");
      return;
    }

    const actorRoles = form.cast
      .map((item) => {
        const actorName = item.actorMode === "new"
          ? item.actorName.trim()
          : (actors.find((actor) => actor.id === item.actorId)?.name || "");
        const roleName = item.roleMode === "new"
          ? item.roleName.trim()
          : (roles.find((role) => role.id === item.roleId)?.name || "");

        return { actorName, roleName };
      })
      .filter((item) => item.actorName && item.roleName);

    const selectedStudioName = studioMode === "existing"
      ? (studios.find((studio) => studio.id === form.studioId)?.name || "")
      : form.studioName.trim();

    if (editing) {
      const updatePayload: UpdateMovieInputDto = {
        id: editing.id,
        title: form.title.trim(),
        originalTitle: form.originalTitle?.trim() || undefined,
        durationMins: form.durationMins,
        releaseDate: form.releaseDate || undefined,
        premiereDate: form.premiereDate || undefined,
        status: form.status,
        description: form.description?.trim() || undefined,
        posterUrl: form.posterUrl?.trim() || undefined,
        trailerUrl: form.trailerUrl?.trim() || undefined,
        studioId: studioMode === "existing" ? form.studioId || undefined : undefined,
        studioName: studioMode === "new" ? form.studioName.trim() : selectedStudioName || undefined,
        ratingId: form.ratingId || undefined,
        genreListId: form.genreListId,
        actorRoles,
        ratingNumber: Math.max(0, Math.min(10, Number(form.ratingNumber) || 0)),
      };

      updateMutation.mutation({ id: editing.id, body: updatePayload });
    } else {
      const actorRoles = form.cast
        .map((item) => ({ actorName: item.actorName.trim(), roleName: item.roleName.trim() }))
        .filter((item) => item.actorName && item.roleName);

      const payload: CreateMovieInputDto = {
        title: form.title.trim(),
        originalTitle: form.originalTitle?.trim() || undefined,
        durationMins: form.durationMins,
        releaseDate: form.releaseDate || undefined,
        premiereDate: form.premiereDate || undefined,
        status: form.status,
        description: form.description?.trim() || undefined,
        posterUrl: form.posterUrl?.trim() || undefined,
        trailerUrl: form.trailerUrl?.trim() || undefined,
        studioId: studioMode === "existing" ? form.studioId || undefined : undefined,
        studioName: selectedStudioName || undefined,
        ratingId: form.ratingId || undefined,
        genreListId: form.genreListId,
        actorRoles,
        ratingNumber: Math.max(0, Math.min(10, Number(form.ratingNumber) || 0)),
      };

      createMutation.mutation(payload);
    }
  };

  const updateCastRow = (index: number, field: keyof MovieCastFormEntry, value: string) => {
    if (field === "actorMode" && value === "existing") {
      ensureActorsLoaded();
    }
    if (field === "roleMode" && value === "existing") {
      ensureRolesLoaded();
    }

    setForm((prev) => {
      const nextCast = [...prev.cast];
      nextCast[index] = { ...nextCast[index], [field]: value };
      return { ...prev, cast: nextCast };
    });
  };

  const addCastRow = () => {
    setForm((prev) => ({
      ...prev,
      cast: [...prev.cast, createEmptyCastRow("new")]
    }));
  };

  const removeCastRow = (index: number) => {
    setForm((prev) => {
      if (prev.cast.length <= 1) {
        return {
          ...prev,
          cast: [createEmptyCastRow("new")]
        };
      }
      return { ...prev, cast: prev.cast.filter((_, i) => i !== index) };
    });
  };

  useEffect(() => {
    if (!dialogOpen || studioMode !== "existing") {
      return;
    }

    ensureStudiosLoaded();
  }, [dialogOpen, studioMode]);

  useEffect(() => {
    if (!dialogOpen || studioMode !== "existing" || form.studioId || studios.length === 0) {
      return;
    }

    setForm((prev) => ({ ...prev, studioId: studios[0].id }));
  }, [dialogOpen, studioMode, form.studioId, studios]);

  const handleDeleteMovie = (movieId: string) => {
    removeMutation.mutation(movieId);
  };

  const renderEmptyDropdownState = (label: string) => (
    <div className="px-3 py-6 flex flex-col items-center justify-center text-center text-muted-foreground-shadcn gap-2">
      <Inbox className="h-5 w-5" />
      <span className="text-xs">Trống {label}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Quản lý phim</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm phim
        </LTTButton>
      </div>

      <LTTTabs value={tab} onValueChange={setTab}>
        <LTTTabsList className="bg-muted-shadcn/50">
          <LTTTabsTrigger value="all">
            Tất cả ({items.length})
          </LTTTabsTrigger>
          <LTTTabsTrigger value="now_showing">
            Đang chiếu ({items.filter((m) => m.status === "now_showing").length})
          </LTTTabsTrigger>
          <LTTTabsTrigger value="coming_soon">
            Sắp chiếu ({items.filter((m) => m.status === "coming_soon").length})
          </LTTTabsTrigger>
          <LTTTabsTrigger value="ended">
            Đã kết thúc ({items.filter((m) => m.status === "ended").length})
          </LTTTabsTrigger>
        </LTTTabsList>
      </LTTTabs>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <LTTButton
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={fetchData}
          loading={listMutation.isLoading}
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </LTTButton>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="px-4 py-3 text-left font-semibold">STT</th>
              <th className="px-4 py-3 text-left font-semibold">Tên phim</th>
              <th className="px-4 py-3 text-left font-semibold">Thể loại</th>
              <th className="px-4 py-3 text-left font-semibold">Thời lượng</th>
              <th className="px-4 py-3 text-left font-semibold">Giới hạn độ tuổi</th>
              <th className="px-4 py-3 text-left font-semibold">Ngày công chiếu</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                    <LTTButton
                      size="sm"
                      onClick={fetchData}
                      loading={listMutation.isLoading}
                      className="mx-auto"
                    >
                      Thử lại
                    </LTTButton>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground-shadcn">
                  {listMutation.isLoading ? "Đang tải dữ liệu..." : "Không tìm thấy phim nào phù hợp."}
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors cursor-pointer"
                  onClick={() => openDetails(item)}
                >
                  <td className="px-4 py-3 text-muted-foreground-shadcn">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <Film className="h-4 w-4 text-primary-shadcn shrink-0" />
                    <div>
                      <div className="font-bold">{item.title}</div>
                      {item.originalTitle && <div className="text-[10px] text-muted-foreground-shadcn italic">{item.originalTitle}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {getGenreLabel(item)}
                  </td>
                  <td className="px-4 py-3 text-xs">{item.durationMins} phút</td>
                  <td className="px-4 py-3">
                    <LTTBadge className="bg-accent-shadcn text-accent-shadcn-foreground border-red-200">
                      {getRatingLabel(item)}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3 text-xs">{toDateLabel(item.premiereDate)}</td>
                  <td className="px-4 py-3">
                    <LTTBadge className={cn("font-medium", statusColor[item.status || "coming_soon"])}>
                      {statusLabel[item.status || "coming_soon"]}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEdit(item);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteMovie(item.id);
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

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border-shadcn bg-card px-4 py-3">
        <div className="text-sm text-muted-foreground-shadcn">
          Tổng: {totalCount || items.length} phim
        </div>
        <div className="flex items-center gap-2">
          <LTTSelect value={String(fetch)} onValueChange={(value) => {
            setPage(1);
            setFetch(Number(value));
          }}>
            <LTTSelectTrigger className="w-24">
              <LTTSelectValue />
            </LTTSelectTrigger>
            <LTTSelectContent>
              <LTTSelectItem value="10">10</LTTSelectItem>
              <LTTSelectItem value="20">20</LTTSelectItem>
              <LTTSelectItem value="50">50</LTTSelectItem>
            </LTTSelectContent>
          </LTTSelect>
          <LTTButton
            variant="outline"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1 || listMutation.isLoading}
          >
            Trước
          </LTTButton>
          <span className="text-sm">Trang {page} / {totalPages}</span>
          <LTTButton
            variant="outline"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= totalPages || listMutation.isLoading}
          >
            Sau
          </LTTButton>
        </div>
      </div>

      <LTTDialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <LTTDialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <LTTDialogHeader>
            <LTTDialogTitle>Thông tin phim</LTTDialogTitle>
          </LTTDialogHeader>
          {viewingMovie ? (
            <div className="grid gap-4 py-2 sm:grid-cols-2 text-sm">
              <div className="space-y-2 sm:col-span-2">
                <LTTLabel>Tên phim</LTTLabel>
                <LTTInput value={viewingMovie.title || "-"} readOnly />
              </div>
              <div className="space-y-2">
                <LTTLabel>Studio</LTTLabel>
                <LTTInput value={viewingMovie.studioName || viewingMovie.studio?.name || "-"} readOnly />
              </div>
              <div className="space-y-2">
                <LTTLabel>Thể loại</LTTLabel>
                <LTTInput value={getGenreLabel(viewingMovie)} readOnly />
              </div>
              <div className="space-y-2">
                <LTTLabel>Thời lượng</LTTLabel>
                <LTTInput value={viewingMovie.durationMins ? `${viewingMovie.durationMins} phút` : "-"} readOnly />
              </div>
              <div className="space-y-2">
                <LTTLabel>Rating</LTTLabel>
                <LTTInput value={getRatingLabel(viewingMovie)} readOnly />
              </div>
              <div className="space-y-2">
                <LTTLabel>Premiere</LTTLabel>
                <LTTInput value={toDateLabel(viewingMovie.premiereDate)} readOnly />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <LTTLabel>Trạng thái</LTTLabel>
                <LTTInput
                  value={statusLabel[viewingMovie.status || "coming_soon"] || viewingMovie.status || "-"}
                  readOnly
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <LTTLabel>Mô tả</LTTLabel>
                <LTTInput value={viewingMovie.description || "-"} readOnly />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <LTTLabel>Diễn viên / Vai diễn</LTTLabel>
                <div className="rounded-md border border-border-shadcn p-3 text-xs space-y-2 max-h-40 overflow-y-auto">
                  {(viewingMovie.actorRoles && viewingMovie.actorRoles.length > 0)
                    ? viewingMovie.actorRoles.map((item, index) => (
                      <div key={`${item.actorName}-${item.roleName}-${index}`} className="flex items-center justify-between gap-2">
                        <span>{item.actorName}</span>
                        <span className="text-muted-foreground-shadcn">{item.roleName}</span>
                      </div>
                    ))
                    : (viewingMovie.cast && viewingMovie.cast.length > 0)
                      ? viewingMovie.cast.map((item, index) => (
                        <div key={`${item.actorName || item.actor?.name || index}-${item.roleName || item.role?.name || index}`} className="flex items-center justify-between gap-2">
                          <span>{item.actorName || item.actor?.name || "-"}</span>
                          <span className="text-muted-foreground-shadcn">{item.roleName || item.role?.name || "-"}</span>
                        </div>
                      ))
                      : <span className="text-muted-foreground-shadcn">-</span>}
                </div>
              </div>
              <div className="space-y-2">
                <LTTLabel>Ngày khởi chiếu</LTTLabel>
                <LTTInput value={toDateLabel(viewingMovie.releaseDate)} readOnly />
              </div>
              <div className="space-y-2">
                <LTTLabel>Ngày công chiếu</LTTLabel>
                <LTTInput value={toDateLabel(viewingMovie.premiereDate)} readOnly />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <LTTLabel>Poster URL</LTTLabel>
                <LTTInput value={viewingMovie.posterUrl || "-"} readOnly />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <LTTLabel>Trailer URL</LTTLabel>
                <LTTInput value={viewingMovie.trailerUrl || "-"} readOnly />
              </div>
            </div>
          ) : null}
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDetailsOpen(false)}>
              Đóng
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={dialogOpen} onOpenChange={handleSafeDialogOpenChange}>
        <LTTDialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <LTTDialogHeader>
            <LTTDialogTitle>
              <div className="flex items-center gap-2">
                <span>{editing ? "Chỉnh sửa phim" : "Thêm phim mới"}</span>
                {metadataQueueLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground-shadcn" />}
              </div>
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <LTTLabel>Tên phim *</LTTLabel>
              <LTTInput
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Tên gốc (Tiếng Anh/Gốc)</LTTLabel>
              <LTTInput
                value={form.originalTitle}
                onChange={(e) => setForm({ ...form, originalTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Hãng sản xuất (Studio) *</LTTLabel>
              <div className="space-y-2">
                <LTTSelect value={studioMode} onValueChange={(v) => setStudioMode(v as "existing" | "new")}>
                  <LTTSelectTrigger>
                    <LTTSelectValue />
                  </LTTSelectTrigger>
                  <LTTSelectContent>
                    <LTTSelectItem value="existing">Chọn studio có sẵn</LTTSelectItem>
                    <LTTSelectItem value="new">Nhập studio mới</LTTSelectItem>
                  </LTTSelectContent>
                </LTTSelect>
                {studioMode === "existing" ? (
                  <LTTSelect
                    value={form.studioId}
                    onValueChange={(v) => setForm({ ...form, studioId: v })}
                  >
                    <LTTSelectTrigger>
                      <LTTSelectValue placeholder="Chọn Studio" />
                    </LTTSelectTrigger>
                    <LTTSelectContent>
                      {studiosMutation.isLoading ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">Đang tải studio...</div>
                      ) : studios.length === 0 ? (
                        renderEmptyDropdownState("studio")
                      ) : (
                        studios.map((studio) => (
                          <LTTSelectItem key={studio.id} value={studio.id}>{studio.name}</LTTSelectItem>
                        ))
                      )}
                    </LTTSelectContent>
                  </LTTSelect>
                ) : (
                  <LTTInput
                    value={form.studioName}
                    onChange={(e) => setForm({ ...form, studioName: e.target.value })}
                    placeholder="Nhập tên studio mới"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <LTTLabel>Thời lượng (phút)</LTTLabel>
              <LTTInput
                type="number"
                value={form.durationMins}
                onChange={(e) => setForm({ ...form, durationMins: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>IMDb Rating (0.0 - 10.0)</LTTLabel>
              <LTTInput
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={form.ratingNumber}
                onChange={(e) => setForm({ ...form, ratingNumber: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Rating *</LTTLabel>
              <LTTSelect
                value={form.ratingId}
                onValueChange={(value) => setForm({ ...form, ratingId: value })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder="Chọn Rating" />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {ratingsMutation.isLoading ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">Đang tải rating...</div>
                  ) : ratings.length === 0 ? (
                    renderEmptyDropdownState("rating")
                  ) : (
                    ratings.map((rating) => (
                      <LTTSelectItem key={rating.id} value={rating.id}>{rating.name}</LTTSelectItem>
                    ))
                  )}
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>Trạng thái</LTTLabel>
              <LTTSelect
                value={form.status}
                onValueChange={(v: any) => setForm({ ...form, status: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="coming_soon">Sắp chiếu</LTTSelectItem>
                  <LTTSelectItem value="now_showing">Đang chiếu</LTTSelectItem>
                  <LTTSelectItem value="ended">Đã kết thúc</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Genre</LTTLabel>
              <div className="rounded-md border border-border-shadcn p-3 space-y-2 max-h-40 overflow-y-auto">
                {genresMutation.isLoading ? (
                  <div className="text-xs text-muted-foreground-shadcn">Đang tải genre...</div>
                ) : genres.length === 0 ? (
                  renderEmptyDropdownState("genre")
                ) : (
                  genres.map((genre) => {
                    const checked = form.genreListId.includes(genre.id);
                    return (
                      <label key={genre.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <LTTCheckbox
                          checked={checked}
                          onCheckedChange={() => {
                            setForm((prev) => ({
                              ...prev,
                              genreListId: checked
                                ? prev.genreListId.filter((id) => id !== genre.id)
                                : [...prev.genreListId, genre.id],
                            }));
                          }}
                        />
                        <span>{genre.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Mô tả phim</LTTLabel>
              <LTTInput
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <LTTLabel>Diễn viên và vai diễn</LTTLabel>
                <LTTButton type="button" variant="outline" size="sm" onClick={addCastRow}>
                  Thêm diễn viên
                </LTTButton>
              </div>
              <div className="space-y-3">
                {form.cast.map((item, index) => (
                  <div key={index} className="rounded-md border border-border-shadcn p-3 space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5 space-y-2">
                        <LTTLabel>Diễn viên</LTTLabel>
                        <LTTSelect
                          value={item.actorMode}
                          onValueChange={(value) => updateCastRow(index, "actorMode", value)}
                        >
                          <LTTSelectTrigger>
                            <LTTSelectValue />
                          </LTTSelectTrigger>
                          <LTTSelectContent>
                            <LTTSelectItem value="existing">Chọn có sẵn</LTTSelectItem>
                            <LTTSelectItem value="new">Nhập mới</LTTSelectItem>
                          </LTTSelectContent>
                        </LTTSelect>
                        {item.actorMode === "existing" ? (
                          <LTTSelect
                            value={item.actorId}
                            onValueChange={(value) => updateCastRow(index, "actorId", value)}
                          >
                            <LTTSelectTrigger>
                              <LTTSelectValue placeholder="Chọn diễn viên" />
                            </LTTSelectTrigger>
                            <LTTSelectContent>
                              {actorsMutation.isLoading ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">Đang tải diễn viên...</div>
                              ) : actors.length === 0 ? (
                                renderEmptyDropdownState("diễn viên")
                              ) : (
                                actors.map((actor) => (
                                  <LTTSelectItem key={actor.id} value={actor.id}>{actor.name}</LTTSelectItem>
                                ))
                              )}
                            </LTTSelectContent>
                          </LTTSelect>
                        ) : (
                          <LTTInput
                            value={item.actorName}
                            placeholder="Tên diễn viên mới"
                            onChange={(e) => updateCastRow(index, "actorName", e.target.value)}
                          />
                        )}
                      </div>
                      <div className="col-span-5 space-y-2">
                        <LTTLabel>Vai diễn</LTTLabel>
                        <LTTSelect
                          value={item.roleMode}
                          onValueChange={(value) => updateCastRow(index, "roleMode", value)}
                        >
                          <LTTSelectTrigger>
                            <LTTSelectValue />
                          </LTTSelectTrigger>
                          <LTTSelectContent>
                            <LTTSelectItem value="existing">Chọn có sẵn</LTTSelectItem>
                            <LTTSelectItem value="new">Nhập mới</LTTSelectItem>
                          </LTTSelectContent>
                        </LTTSelect>
                        {item.roleMode === "existing" ? (
                          <LTTSelect
                            value={item.roleId}
                            onValueChange={(value) => updateCastRow(index, "roleId", value)}
                          >
                            <LTTSelectTrigger>
                              <LTTSelectValue placeholder="Chọn vai diễn" />
                            </LTTSelectTrigger>
                            <LTTSelectContent>
                              {rolesMutation.isLoading ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">Đang tải vai diễn...</div>
                              ) : roles.length === 0 ? (
                                renderEmptyDropdownState("vai diễn")
                              ) : (
                                roles.map((role) => (
                                  <LTTSelectItem key={role.id} value={role.id}>{role.name}</LTTSelectItem>
                                ))
                              )}
                            </LTTSelectContent>
                          </LTTSelect>
                        ) : (
                          <LTTInput
                            value={item.roleName}
                            placeholder="Vai diễn mới"
                            onChange={(e) => updateCastRow(index, "roleName", e.target.value)}
                          />
                        )}
                      </div>
                      <div className="col-span-2 flex items-end">
                        <LTTButton type="button" variant="ghost" onClick={() => removeCastRow(index)}>
                          Xóa
                        </LTTButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <LTTLabel>Poster URL</LTTLabel>
              <LTTInput
                value={form.posterUrl}
                onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Trailer URL (Youtube/Vimeo)</LTTLabel>
              <LTTInput
                value={form.trailerUrl}
                onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Ngày khởi chiếu</LTTLabel>
              <LTTInput
                type="date"
                value={form.releaseDate}
                onChange={(e) =>
                  setForm({ ...form, releaseDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Ngày công chiếu (Premiere)</LTTLabel>
              <LTTInput
                type="date"
                value={form.premiereDate}
                onChange={(e) => setForm({ ...form, premiereDate: e.target.value })}
              />
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={requestCloseDialog}>
              Hủy
            </LTTButton>
            <LTTButton onClick={save}>
              {editing ? "Lưu thay đổi" : "Tạo mới phim"}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Bạn có thay đổi chưa lưu</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-2 text-sm text-muted-foreground-shadcn leading-relaxed">
            Bạn có thay đổi chưa hoàn tất. Thoát sẽ <strong className="text-destructive">xóa toàn bộ nội dung đang nhập</strong>. Bạn có chắc chắn muốn thoát?
          </div>
          <LTTDialogFooter className="gap-2">
            <LTTButton variant="outline" onClick={() => setExitConfirmOpen(false)} className="flex-1">
              Ở lại chỉnh sửa
            </LTTButton>
            <LTTButton variant="destructive" onClick={handleConfirmExitDialog} className="flex-1">
              Thoát
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

    </div>
  );
}
