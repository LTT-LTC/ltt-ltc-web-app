"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Search, Film, RefreshCw, Inbox, Loader2, X, Check, ChevronsUpDown, Upload } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import {
  LTTPopover,
  LTTPopoverContent,
  LTTPopoverTrigger,
} from "@/src/@core/component/LTTShadcnUI/LTTPopover";
import {
  LTTCommand,
  LTTCommandEmpty,
  LTTCommandGroup,
  LTTCommandInput,
  LTTCommandItem,
  LTTCommandList,
} from "@/src/@core/component/LTTShadcnUI/LTTCommand";
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
import { useLocalization } from "@/src/@core/hooks/use-localization";

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

const buildActorRolesPayload = (
  cast: MovieCastFormEntry[],
  actors: ActorOutputDto[],
  roles: RoleOutputDto[]
) => {
  return cast
    .map((item) => {
      const actorName = item.actorMode === "new"
        ? item.actorName.trim()
        : (actors.find((actor) => actor.id === item.actorId)?.name || item.actorName.trim());
      const roleName = item.roleMode === "new"
        ? item.roleName.trim()
        : (roles.find((role) => role.id === item.roleId)?.name || item.roleName.trim());

      return { actorName, roleName };
    })
    .filter((item) => item.actorName && item.roleName);
};

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

const statusTextKey: Record<string, string> = {
  now_showing: "admin.manager_movies.status.now_showing",
  coming_soon: "admin.manager_movies.status.coming_soon",
  ended: "admin.manager_movies.status.ended",
};
const statusColor: Record<string, string> = {
  now_showing: "bg-green-100 text-green-700 border-green-200",
  coming_soon: "bg-blue-100 text-blue-700 border-blue-200",
  ended: "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
};

const Combobox = ({ value, onChange, options, placeholder, allowCreate = true }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; allowCreate?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const showCreate = allowCreate && search.trim() && !options.some((o) => o.toLowerCase() === search.trim().toLowerCase());
  return (
    <LTTPopover open={open} onOpenChange={setOpen}>
      <LTTPopoverTrigger asChild>
        <LTTButton variant="outline" role="combobox" className="w-full justify-between font-normal text-foreground-shadcn">
          <span className={cn(!value && "text-muted-foreground-shadcn")}>{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </LTTButton>
      </LTTPopoverTrigger>
      <LTTPopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <LTTCommand>
          <LTTCommandInput placeholder="Tìm kiếm..." value={search} onValueChange={setSearch} />
          <LTTCommandList>
            <LTTCommandEmpty>Không tìm thấy</LTTCommandEmpty>
            <LTTCommandGroup>
              {options.map((opt) => (
                <LTTCommandItem key={opt} value={opt} onSelect={() => { onChange(opt); setOpen(false); setSearch(""); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === opt ? "opacity-100" : "opacity-0")} />
                  {opt}
                </LTTCommandItem>
              ))}
              {showCreate && (
                <LTTCommandItem onSelect={() => { onChange(search.trim()); setOpen(false); setSearch(""); }}>
                  <Plus className="mr-2 h-4 w-4" /> Thêm mới: <strong className="ml-1">{search.trim()}</strong>
                </LTTCommandItem>
              )}
            </LTTCommandGroup>
          </LTTCommandList>
        </LTTCommand>
      </LTTPopoverContent>
    </LTTPopover>
  );
};

const MultiSelect = ({ values, onChange, options, placeholder, displayOptions, allowCreate = false }: {
  values: string[]; onChange: (v: string[]) => void; options: string[]; placeholder: string;
  displayOptions?: Array<{ label: string, value: string }>;
  allowCreate?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const toggle = (opt: string) => values.includes(opt) ? onChange(values.filter((v) => v !== opt)) : onChange([...values, opt]);
  const availableOptionsText = displayOptions ? displayOptions.map(x => x.label) : options;
  const showCreate = allowCreate && search.trim() && !availableOptionsText.some(o => o.toLowerCase() === search.trim().toLowerCase());
  return (
    <LTTPopover open={open} onOpenChange={setOpen}>
      <LTTPopoverTrigger asChild>
        <LTTButton variant="outline" role="combobox" className="w-full justify-between font-normal h-auto min-h-10 py-2 text-foreground-shadcn">
          <div className="flex flex-wrap gap-1">
            {values.length === 0 ? <span className="text-muted-foreground-shadcn">{placeholder}</span> :
              values.map((v) => {
                const text = displayOptions?.find(x => x.value === v)?.label || v;
                return (
                  <LTTBadge key={v} variant="secondary" className="gap-1 bg-muted-shadcn/50 pointer-events-auto">
                    {text}
                    <X className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggle(v); }} />
                  </LTTBadge>
                );
              })
            }
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </LTTButton>
      </LTTPopoverTrigger>
      <LTTPopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <LTTCommand>
          <LTTCommandInput placeholder="Tìm kiếm..." value={search} onValueChange={setSearch} />
          <LTTCommandList>
            <LTTCommandEmpty>Không tìm thày</LTTCommandEmpty>
            <LTTCommandGroup>
              {options.map((opt) => {
                const text = displayOptions?.find(x => x.value === opt)?.label || opt;
                return (
                  <LTTCommandItem key={opt} value={text} onSelect={() => { toggle(opt); }}>
                    <Check className={cn("mr-2 h-4 w-4", values.includes(opt) ? "opacity-100" : "opacity-0")} />
                    {text}
                  </LTTCommandItem>
                )
              })}
              {showCreate && (
                <LTTCommandItem onSelect={() => { onChange([...values, search.trim()]); setSearch(""); }}>
                  <Plus className="mr-2 h-4 w-4" /> Thêm mới: <strong className="ml-1">{search.trim()}</strong>
                </LTTCommandItem>
              )}
            </LTTCommandGroup>
          </LTTCommandList>
        </LTTCommand>
      </LTTPopoverContent>
    </LTTPopover>
  );
};

export default function MoviesPage() {
  const { t, currentLanguage } = useLocalization();
  const [items, setItems] = useState<MovieOutputDto[]>([]);
  const [genres, setGenres] = useState<GenreOutputDto[]>([]);
  const [studios, setStudios] = useState<StudioOutputDto[]>([]);
  const [ratings, setRatings] = useState<RatingOutputDto[]>([]);
  const [actors, setActors] = useState<ActorOutputDto[]>([]);
  const [roles, setRoles] = useState<RoleOutputDto[]>([]);
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingMovie, setViewingMovie] = useState<MovieOutputDto | null>(null);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [deleteConfirmMovie, setDeleteConfirmMovie] = useState<MovieOutputDto | null>(null);
  const [editing, setEditing] = useState<MovieOutputDto | null>(null);
  const [studioMode, setStudioMode] = useState<"existing" | "new">("existing");
  const [genresLoaded, setGenresLoaded] = useState(false);
  const [studiosLoaded, setStudiosLoaded] = useState(false);
  const [ratingsLoaded, setRatingsLoaded] = useState(false);
  const [actorsLoaded, setActorsLoaded] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [metadataQueueLoading, setMetadataQueueLoading] = useState(false);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState("");
  const [posterImageFile, setPosterImageFile] = useState<File | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState("");
  const skipNextFetchRef = useRef(false);
  const [form, setForm] = useState({
    title: "",
    originalTitle: "",
    durationMins: 120,
    ratingId: "",
    genreListId: [] as string[],
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

  const isDialogDirty = dialogOpen && (
    (initialFormSnapshot.length > 0 && initialFormSnapshot !== buildFormSnapshot(form, studioMode)) ||
    !!posterImageFile
  );

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
      const errorMsg = typeof err?.message === "string" && err.message.trim()
        ? err.message
        : t("admin.manager_movies.fetch_error");
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
      toast.success(t("admin.manager_movies.create_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.manager_movies.generic_error"))
  });

  const updateMutation = useLTTMutation<MovieOutputDto | undefined, { id: string; body: UpdateMovieInputDto }>({
    mutationFn: (input) => movieService.updateMovieAsync(input.id, input.body),
    onSuccess: () => {
      toast.success(t("admin.manager_movies.update_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.manager_movies.generic_error"))
  });

  const removeMutation = useLTTMutation<void, string>({
    mutationFn: (id) => movieService.deleteMovieAsync(id),
    onSuccess: () => {
      toast.success(t("admin.manager_movies.delete_success"));
      setDeleteConfirmMovie(null);
      fetchData();
    },
    onError: (err) => {
      setDeleteConfirmMovie(null);
      toast.error(err.message || t("admin.manager_movies.generic_error"));
    }
  });

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || removeMutation.isLoading;
  const saveLoading = createMutation.isLoading || updateMutation.isLoading;

  const fetchData = () => {
    listMutation.mutation({
      page,
      fetch,
      keyword: "",
      // Status filter mapping if needed
    });
  };

  const totalPages = Math.max(1, Math.ceil((totalCount || items.length) / fetch));

  useEffect(() => {
    if (skipNextFetchRef.current && page !== 1) {
      return;
    }
    if (skipNextFetchRef.current && page === 1) {
      skipNextFetchRef.current = false;
    }
    fetchData();
  }, [page, fetch]);

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
    if (movie.ratingCode) {
      return movie.ratingCode;
    }
    if (movie.ratingId) {
      const matchedRating = ratings.find((rating) => rating.id === movie.ratingId);
      return matchedRating?.code || matchedRating?.name || movie.ratingId;
    }
    if (movie.ratingName) {
      return movie.ratingName;
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
    return date.toLocaleDateString(currentLanguage === "en" ? "en-US" : "vi-VN");
  };

  const getStatusLabel = (status?: string) => {
    const key = statusTextKey[status || "coming_soon"];
    return key ? t(key) : status || "-";
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
    setPosterImageFile(null);
    setPosterPreviewUrl("");
    setForm(nextForm);
    void queueMetadataFetch([
      ensureGenresLoaded,
      ensureRatingsLoaded,
      ensureStudiosLoaded,
      ensureActorsLoaded,
      ensureRolesLoaded,
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
    setPosterImageFile(null);
    setPosterPreviewUrl(m.posterUrl || "");
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
    if (saveLoading) {
      return;
    }

    if (!form.title.trim()) {
      toast.error(t("admin.manager_movies.validation.title_required"));
      return;
    }

    if (studioMode === "new" && !form.studioName.trim()) {
      toast.error(t("admin.manager_movies.validation.studio_name_required"));
      return;
    }

    if (studioMode === "existing" && !form.studioId) {
      toast.error(t("admin.manager_movies.validation.studio_required"));
      return;
    }

    if (!form.ratingId) {
      toast.error(t("admin.manager_movies.validation.rating_required"));
      return;
    }

    const actorRoles = buildActorRolesPayload(form.cast, actors, roles);

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
        imageFile: posterImageFile || undefined,
        trailerUrl: form.trailerUrl?.trim() || undefined,
        studioId: studioMode === "existing" ? form.studioId || undefined : undefined,
        studioName: studioMode === "new" ? form.studioName.trim() : selectedStudioName || undefined,
        ratingId: form.ratingId || undefined,
        genreListId: form.genreListId,
        actorRoles,
      };

      updateMutation.mutation({ id: editing.id, body: updatePayload });
    } else {
      const payload: CreateMovieInputDto = {
        title: form.title.trim(),
        originalTitle: form.originalTitle?.trim() || undefined,
        durationMins: form.durationMins,
        releaseDate: form.releaseDate || undefined,
        premiereDate: form.premiereDate || undefined,
        status: form.status,
        description: form.description?.trim() || undefined,
        posterUrl: form.posterUrl?.trim() || undefined,
        imageFile: posterImageFile || undefined,
        trailerUrl: form.trailerUrl?.trim() || undefined,
        studioId: studioMode === "existing" ? form.studioId || undefined : undefined,
        studioName: selectedStudioName || undefined,
        ratingId: form.ratingId || undefined,
        genreListId: form.genreListId,
        actorRoles,
      };

      createMutation.mutation(payload);
    }
  };

  useEffect(() => {
    if (!posterImageFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(posterImageFile);
    setPosterPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [posterImageFile]);

  useEffect(() => {
    if (!isDialogDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDialogDirty]);

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

  const requestDeleteMovie = (movie: MovieOutputDto) => {
    if (removeMutation.isLoading) {
      return;
    }
    setDeleteConfirmMovie(movie);
  };

  const handleDeleteMovie = () => {
    if (!deleteConfirmMovie || removeMutation.isLoading) {
      return;
    }

    removeMutation.mutation(deleteConfirmMovie.id);
  };

  const renderEmptyDropdownState = (label: string) => (
    <div className="px-3 py-6 flex flex-col items-center justify-center text-center text-muted-foreground-shadcn gap-2">
      <Inbox className="h-5 w-5" />
      <span className="text-xs">{t("admin.manager_movies.empty_item", { label })}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.manager_movies.title")}</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> {t("admin.manager_movies.add_movie")}
        </LTTButton>
      </div>

      <div className="flex items-center gap-3 py-3">
        <LTTTabs value={tab} onValueChange={setTab}>
          <LTTTabsList className="bg-muted-shadcn/50">
            <LTTTabsTrigger value="all">
              {t("admin.manager_movies.tabs.all", { count: items.length })}
            </LTTTabsTrigger>
            <LTTTabsTrigger value="now_showing">
              {t("admin.manager_movies.tabs.now_showing", { count: items.filter((m) => m.status === "now_showing").length })}
            </LTTTabsTrigger>
            <LTTTabsTrigger value="coming_soon">
              {t("admin.manager_movies.tabs.coming_soon", { count: items.filter((m) => m.status === "coming_soon").length })}
            </LTTTabsTrigger>
            <LTTTabsTrigger value="ended">
              {t("admin.manager_movies.tabs.ended", { count: items.filter((m) => m.status === "ended").length })}
            </LTTTabsTrigger>
          </LTTTabsList>
        </LTTTabs>
        <LTTButton
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={fetchData}
          loading={listMutation.isLoading}
        >
          <RefreshCw className="h-4 w-4" /> {t("admin.manager_movies.refresh")}
        </LTTButton>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm py-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="px-4 py-3 text-left font-semibold">{t("admin.manager_movies.table.index")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.manager_movies.table.movie_name")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.manager_movies.table.genre")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.manager_movies.table.duration")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.manager_movies.table.rating")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.manager_movies.table.premiere")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.manager_movies.table.status")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("admin.manager_movies.table.actions")}</th>
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
                      {t("admin.manager_movies.retry")}
                    </LTTButton>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground-shadcn">
                  {listMutation.isLoading ? t("admin.manager_movies.loading") : t("admin.manager_movies.empty")}
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
                  <td className="px-4 py-3 text-xs">{t("admin.manager_movies.duration_minutes", { minutes: item.durationMins })}</td>
                  <td className="px-4 py-3">
                    <LTTBadge className="bg-accent-shadcn text-accent-shadcn-foreground border-red-200">
                      {getRatingLabel(item)}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3 text-xs">{toDateLabel(item.premiereDate)}</td>
                  <td className="px-4 py-3">
                    <LTTBadge className={cn("font-medium", statusColor[item.status || "coming_soon"])}>
                      {getStatusLabel(item.status)}
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
                          requestDeleteMovie(item);
                        }}
                        disabled={removeMutation.isLoading}
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

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border-shadcn bg-card px-4 py-3 my-3">
        <div className="text-sm text-muted-foreground-shadcn">
          {t("admin.manager_movies.total_movies", { count: totalCount || items.length })}
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
            {t("admin.manager_movies.previous")}
          </LTTButton>
          <span className="text-sm">{t("admin.manager_movies.page", { page, totalPages })}</span>
          <LTTButton
            variant="outline"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= totalPages || listMutation.isLoading}
          >
            {t("admin.manager_movies.next")}
          </LTTButton>
        </div>
      </div>

      <LTTDialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <LTTDialogContent className="sm:max-w-4xl p-0 gap-0 grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] sm:max-h-[90vh]">
          <LTTDialogHeader className="px-6 pt-6 pb-4 border-b border-border-shadcn">
            <LTTDialogTitle>{t("admin.manager_movies.details.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          {viewingMovie ? (
            <div className="overflow-y-auto px-6 py-5">
              <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
                <div className="space-y-2">
                  <LTTLabel>{t("admin.manager_movies.form.poster_url")}</LTTLabel>
                  <div className="relative aspect-[2/3] w-full rounded-lg border-2 border-border-shadcn overflow-hidden bg-muted-shadcn/30">
                    {viewingMovie.posterUrl ? (
                      <img src={viewingMovie.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-muted-foreground-shadcn text-xs">
                        <Film className="mb-2 h-8 w-8 opacity-50" />
                        <span>{t("admin.manager_movies.no_image") || "No Image"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div className="space-y-2 sm:col-span-2">
                    <LTTLabel>{t("admin.manager_movies.form.movie_name")}</LTTLabel>
                    <LTTInput value={viewingMovie.title || "-"} readOnly />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <LTTLabel>{t("admin.manager_movies.form.original_title")}</LTTLabel>
                    <LTTInput value={viewingMovie.originalTitle || "-"} readOnly />
                  </div>
                  <div className="space-y-2">
                    <LTTLabel>{t("admin.manager_movies.details.studio")}</LTTLabel>
                    <LTTInput value={viewingMovie.studioName || viewingMovie.studio?.name || "-"} readOnly />
                  </div>
                  <div className="space-y-2">
                    <LTTLabel>{t("admin.manager_movies.table.duration")}</LTTLabel>
                    <LTTInput value={viewingMovie.durationMins ? t("admin.manager_movies.duration_minutes", { minutes: viewingMovie.durationMins }) : "-"} readOnly />
                  </div>
                  <div className="space-y-2">
                    <LTTLabel>{t("admin.manager_movies.form.rating")}</LTTLabel>
                    <LTTInput value={getRatingLabel(viewingMovie)} readOnly />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <LTTLabel>{t("admin.manager_movies.table.status")}</LTTLabel>
                    <LTTInput value={getStatusLabel(viewingMovie.status)} readOnly />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <LTTLabel>{t("admin.manager_movies.table.genre")}</LTTLabel>
                    <LTTInput value={getGenreLabel(viewingMovie)} readOnly />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <LTTLabel>{t("admin.manager_movies.form.description")}</LTTLabel>
                    <div className="rounded-md border border-border-shadcn bg-muted-shadcn/20 p-3 text-sm text-muted-foreground-shadcn min-h-[5rem]">
                      {viewingMovie.description || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Cast & Roles ─── */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <LTTLabel>{t("admin.manager_movies.form.cast_and_roles")}</LTTLabel>
                </div>
                <div className="rounded-lg border border-border-shadcn bg-muted-shadcn/20 p-3 space-y-2 max-h-40 overflow-y-auto w-full">
                  {(viewingMovie.actorRoles && viewingMovie.actorRoles.length > 0)
                    ? viewingMovie.actorRoles.map((item, index) => (
                      <div key={`${item.actorName}-${item.roleName}-${index}`} className="grid grid-cols-[1fr_1fr] gap-2 items-center bg-background-shadcn rounded p-2 text-xs">
                        <span className="font-medium">{item.actorName}</span>
                        <span className="text-muted-foreground-shadcn">{item.roleName}</span>
                      </div>
                    ))
                    : (viewingMovie.cast && viewingMovie.cast.length > 0)
                      ? viewingMovie.cast.map((item, index) => (
                        <div key={`${item.actorName || item.actor?.name || index}-${item.roleName || item.role?.name || index}`} className="grid grid-cols-[1fr_1fr] gap-2 items-center bg-background-shadcn rounded p-2 text-xs">
                          <span className="font-medium">{item.actorName || item.actor?.name || "-"}</span>
                          <span className="text-muted-foreground-shadcn">{item.roleName || item.role?.name || "-"}</span>
                        </div>
                      ))
                      : <div className="text-center text-sm text-muted-foreground-shadcn py-4">-</div>}
                </div>
              </div>

              {/* ─── Media & Dates ─── */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <LTTLabel>{t("admin.manager_movies.form.trailer_url")}</LTTLabel>
                  <LTTInput value={viewingMovie.trailerUrl || "-"} readOnly />
                </div>
                <div className="space-y-2">
                  <LTTLabel>{t("admin.manager_movies.form.release_date")}</LTTLabel>
                  <LTTInput value={toDateLabel(viewingMovie.releaseDate)} readOnly />
                </div>
                <div className="space-y-2">
                  <LTTLabel>{t("admin.manager_movies.form.premiere_date")}</LTTLabel>
                  <LTTInput value={toDateLabel(viewingMovie.premiereDate)} readOnly />
                </div>
              </div>
            </div>
          ) : null}
          <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn">
            <LTTButton variant="outline" onClick={() => setDetailsOpen(false)}>
              {t("admin.manager_movies.close")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={dialogOpen} onOpenChange={handleSafeDialogOpenChange}>
        <LTTDialogContent className="sm:max-w-4xl p-0 gap-0 grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh] sm:max-h-[90vh]">
          <LTTDialogHeader className="px-6 pt-6 pb-4 border-b border-border-shadcn">
            <LTTDialogTitle>
              <div className="flex items-center gap-2">
                <span>{editing ? t("admin.manager_movies.form.edit_title") : t("admin.manager_movies.form.create_title")}</span>
                {metadataQueueLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground-shadcn" />}
              </div>
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="overflow-y-auto px-6 py-5">
            <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
              <div className="space-y-2">
                <LTTLabel>{t("admin.manager_movies.form.poster_url")}</LTTLabel>
                <div className="relative aspect-2/3 w-full rounded-lg border-2 border-dashed border-[#d9d9d9] bg-[#fafafa] transition-colors hover:border-primary-shadcn/50 overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setPosterImageFile(file);
                      if (!file) {
                        setPosterPreviewUrl(form.posterUrl || "");
                      }
                    }}
                  />
                  {posterPreviewUrl ? (
                    <>
                      <img src={posterPreviewUrl} alt="Poster" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setPosterImageFile(null);
                          setPosterPreviewUrl("");
                          setForm((prev) => ({ ...prev, posterUrl: "" }));
                        }}
                        className="absolute right-2 top-2 z-60 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center px-4">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdecec] text-[#ef4444]">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-foreground-shadcn">
                        {t("admin.manager_movies.form.poster_upload_click_or_drag")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground-shadcn">
                        {t("admin.manager_movies.form.poster_upload_hint")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <LTTLabel>{t("admin.manager_movies.form.movie_name_required")}</LTTLabel>
                  <LTTInput
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <LTTLabel>{t("admin.manager_movies.form.original_title")}</LTTLabel>
                  <LTTInput
                    value={form.originalTitle}
                    onChange={(e) => setForm({ ...form, originalTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <LTTLabel>{t("admin.manager_movies.form.studio_required")}</LTTLabel>
                  <Combobox
                    value={form.studioName || studios.find(s => s.id === form.studioId)?.name || ""}
                    onChange={(val) => {
                      const existing = studios.find(s => s.name.toLowerCase() === val.toLowerCase());
                      if (existing) {
                        setForm(f => ({ ...f, studioId: existing.id, studioName: "" }));
                        setStudioMode("existing");
                      } else {
                        setForm(f => ({ ...f, studioId: "", studioName: val }));
                        setStudioMode("new");
                      }
                    }}
                    options={studios.map(s => s.name)}
                    placeholder={t("admin.manager_movies.form.select_studio_placeholder")}
                    allowCreate={true}
                  />
                </div>
                <div className="space-y-2">
                  <LTTLabel>{t("admin.manager_movies.form.duration_minutes")}</LTTLabel>
                  <LTTInput
                    type="number"
                    value={form.durationMins}
                    onChange={(e) => setForm({ ...form, durationMins: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <LTTLabel>{t("admin.manager_movies.form.rating_required")}</LTTLabel>
                  <LTTSelect
                    value={form.ratingId}
                    onValueChange={(value) => setForm({ ...form, ratingId: value })}
                  >
                    <LTTSelectTrigger>
                      <LTTSelectValue placeholder={t("admin.manager_movies.form.select_rating_placeholder")} />
                    </LTTSelectTrigger>
                    <LTTSelectContent>
                      {ratingsMutation.isLoading ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">{t("admin.manager_movies.loading_ratings")}</div>
                      ) : ratings.length === 0 ? (
                        renderEmptyDropdownState(t("admin.manager_movies.entities.rating"))
                      ) : (
                        ratings.map((rating) => (
                          <LTTSelectItem key={rating.id} value={rating.id}>
                            {`${rating.code || "-"} - ${rating.name || "-"}`}
                          </LTTSelectItem>
                        ))
                      )}
                    </LTTSelectContent>
                  </LTTSelect>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <LTTLabel>{t("admin.manager_movies.form.status")}</LTTLabel>
                  <LTTSelect
                    value={form.status}
                    onValueChange={(v: any) => setForm({ ...form, status: v })}
                  >
                    <LTTSelectTrigger>
                      <LTTSelectValue />
                    </LTTSelectTrigger>
                    <LTTSelectContent>
                      <LTTSelectItem value="coming_soon">{t("admin.manager_movies.status.coming_soon")}</LTTSelectItem>
                      <LTTSelectItem value="now_showing">{t("admin.manager_movies.status.now_showing")}</LTTSelectItem>
                      <LTTSelectItem value="ended">{t("admin.manager_movies.status.ended")}</LTTSelectItem>
                    </LTTSelectContent>
                  </LTTSelect>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <LTTLabel>{t("admin.manager_movies.form.genre")}</LTTLabel>
                  <MultiSelect
                    values={form.genreListId}
                    onChange={(vals) => setForm({ ...form, genreListId: vals })}
                    options={genres.map(g => g.id)}
                    displayOptions={genres.map(g => ({ label: g.name, value: g.id }))}
                    placeholder="Chọn thể loại..."
                    allowCreate={false}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <LTTLabel>{t("admin.manager_movies.form.description")}</LTTLabel>
                  <textarea
                    className="w-full min-h-[5rem] rounded-md border border-border-shadcn bg-background-shadcn px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring-shadcn disabled:cursor-not-allowed disabled:opacity-50"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* ─── Cast & Roles ─── */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <LTTLabel className="text-sm font-medium">{t("admin.manager_movies.form.cast_and_roles")}</LTTLabel>
                <LTTButton type="button" variant="outline" size="sm" className="my-3" onClick={addCastRow}>
                  <Plus className="mr-2 h-4 w-4" /> {t("admin.manager_movies.form.add_actor")}
                </LTTButton>
              </div>
              <div className="rounded-lg border border-border-shadcn bg-muted-shadcn/20 p-3 space-y-2">
                {form.cast.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground-shadcn py-4">
                    -
                  </div>
                ) : (
                  form.cast.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center bg-background-shadcn rounded p-2 border border-border-shadcn my-4">
                      <div className="flex flex-col gap-1 w-full">
                        <LTTLabel className="text-xs text-muted-foreground-shadcn">{t("admin.manager_movies.form.actor")}</LTTLabel>
                        <Combobox
                          value={item.actorMode === "existing" ? (actors.find(a => a.id === item.actorId)?.name || "") : item.actorName}
                          onChange={(val) => {
                            const existing = actors.find(a => a.name.toLowerCase() === val.toLowerCase());
                            if (existing) {
                              updateCastRow(index, "actorId", existing.id);
                              updateCastRow(index, "actorMode", "existing");
                              updateCastRow(index, "actorName", "");
                            } else {
                              updateCastRow(index, "actorId", "");
                              updateCastRow(index, "actorMode", "new");
                              updateCastRow(index, "actorName", val);
                            }
                          }}
                          options={actors.map(a => a.name)}
                          placeholder="Chọn/Nhập diễn viên"
                          allowCreate={true}
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <LTTLabel className="text-xs text-muted-foreground-shadcn">{t("admin.manager_movies.form.role")}</LTTLabel>
                        <Combobox
                          value={item.roleMode === "existing" ? (roles.find(r => r.id === item.roleId)?.name || "") : item.roleName}
                          onChange={(val) => {
                            const existing = roles.find(r => r.name.toLowerCase() === val.toLowerCase());
                            if (existing) {
                              updateCastRow(index, "roleId", existing.id);
                              updateCastRow(index, "roleMode", "existing");
                              updateCastRow(index, "roleName", "");
                            } else {
                              updateCastRow(index, "roleId", "");
                              updateCastRow(index, "roleMode", "new");
                              updateCastRow(index, "roleName", val);
                            }
                          }}
                          options={roles.map(r => r.name)}
                          placeholder="Chọn/Nhập vai diễn"
                          allowCreate={true}
                        />
                      </div>
                      <LTTButton type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0 self-center" onClick={() => removeCastRow(index)}>
                        <Trash2 className="h-4 w-4" />
                      </LTTButton>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ─── Media & Dates ─── */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <LTTLabel>{t("admin.manager_movies.form.trailer_url_hint")}</LTTLabel>
                <LTTInput
                  value={form.trailerUrl}
                  onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <LTTLabel>{t("admin.manager_movies.form.release_date")}</LTTLabel>
                <LTTInput
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) =>
                    setForm({ ...form, releaseDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <LTTLabel>{t("admin.manager_movies.form.premiere_date_hint")}</LTTLabel>
                <LTTInput
                  type="date"
                  value={form.premiereDate}
                  onChange={(e) => setForm({ ...form, premiereDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <LTTDialogFooter className="px-6 py-4 border-t border-border-shadcn">
            <LTTButton variant="outline" onClick={requestCloseDialog} disabled={saveLoading}>
              {t("admin.manager_movies.form.cancel")}
            </LTTButton>
            <LTTButton onClick={save} disabled={saveLoading} className="min-w-[160px]">
              {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? t("admin.manager_movies.form.save_changes") : t("admin.manager_movies.form.create_movie")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.manager_movies.exit_confirm.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-2 text-sm text-muted-foreground-shadcn leading-relaxed">
            {t("admin.manager_movies.exit_confirm.message_before")} <strong className="text-destructive">{t("admin.manager_movies.exit_confirm.message_highlight")}</strong>. {t("admin.manager_movies.exit_confirm.message_after")}
          </div>
          <LTTDialogFooter className="gap-3">
            <LTTButton variant="outline" onClick={() => setExitConfirmOpen(false)} className="flex-1">
              {t("admin.manager_movies.exit_confirm.stay")}
            </LTTButton>
            <LTTButton variant="destructive" onClick={handleConfirmExitDialog} className="flex-1">
              {t("admin.manager_movies.exit_confirm.exit")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog
        open={!!deleteConfirmMovie}
        onOpenChange={(open) => {
          if (!open && !removeMutation.isLoading) {
            setDeleteConfirmMovie(null);
          }
        }}
      >
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.common.delete_confirm.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-2 text-sm text-muted-foreground-shadcn leading-relaxed">
            {t("admin.common.delete_confirm.message")}
          </div>
          <LTTDialogFooter className="gap-3">
            <LTTButton
              variant="outline"
              onClick={() => setDeleteConfirmMovie(null)}
              className="flex-1"
              disabled={removeMutation.isLoading}
            >
              {t("admin.common.delete_confirm.cancel")}
            </LTTButton>
            <LTTButton
              variant="destructive"
              onClick={handleDeleteMovie}
              className="flex-1"
              disabled={removeMutation.isLoading}
            >
              {removeMutation.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("admin.common.delete_confirm.ok")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

    </div>
  );
}
