"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
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
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { screenService } from "@/src/services/administration-service/screen/screen.service";
import { ScreenOutputDto } from "@/src/services/administration-service/screen/models/output.model";
import { GetScreenListInputDto, CreateScreenInputDto, UpdateScreenInputDto } from "@/src/services/administration-service/screen/models/input.model";
import { seatMapService } from "@/src/services/administration-service/seat-map/seat-map.service";
import { SeatMapOutputDto } from "@/src/services/administration-service/seat-map/models/output.model";
import { managerSeatTypeService } from "@/src/services/administration-service/manager/seat-type/seat-type.service";
import { SeatTypeOutputDto } from "@/src/services/administration-service/seat-type/models/output.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";
import { getCookie } from "@/src/@core/utils/cookie";
import { ADMIN_ACCESS_TOKEN_KEY } from "@/src/@core/const";
import { getUserInfoFromToken } from "@/src/@core/utils/jwt";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import LTTScreenCreateWizard from "@/src/@core/component/LTTManager/LTTScreenCreateWizard";
import { Screen, SeatType } from "@/src/@core/const/mock/adminMockData";
import LTTSeatMapViewer from "@/src/@core/component/LTTManager/LTTSeatMapViewer";
import { cinemaService } from "@/src/services/administration-service/cinema/cinema.service";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-red-100 text-red-700 border-red-200",
};

export default function ScreensConfigPage() {
  const { t } = useLocalization();
  const [items, setItems] = useState<ScreenOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string>("");
  const [editing, setEditing] = useState<ScreenOutputDto | null>(null);
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cinemaMissing, setCinemaMissing] = useState(false);
  const [seatMaps, setSeatMaps] = useState<SeatMapOutputDto[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [designDialogOpen, setDesignDialogOpen] = useState(false);
  const [createdSeatMapId, setCreatedSeatMapId] = useState<string>("");

  const [form, setForm] = useState({
    screenNumber: 1,
    screenType: "2D",
    seatCount: 0,
    seatMapId: "",
    seatLayout: "",
    status: "active",
  });

  const listMutation = useLTTMutation<PagedResultDto<ScreenOutputDto> | undefined, { cinemaId: string; params: GetScreenListInputDto }>({
    mutationFn: (input) => screenService.getScreenListAsync(input.cinemaId, input.params),
    onSuccess: (res) => {
      if (res && res.items) {
        setItems(res.items);
        setTotalCount(res.totalCount);
      }
    },
    onError: (err) => toast.error(err.message || t("admin.screens.fetch_error"))
  });

  const createMutation = useLTTMutation<ScreenOutputDto | undefined, { cinemaId: string; body: CreateScreenInputDto }>({
    mutationFn: (input) => screenService.createScreenAsync(input.cinemaId, input.body),
    onSuccess: () => {
      toast.success(t("admin.screens.create_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.screens.generic_error"))
  });

  const updateMutation = useLTTMutation<ScreenOutputDto | undefined, { cinemaId: string; id: string; body: UpdateScreenInputDto }>({
    mutationFn: (input) => screenService.updateScreenAsync(input.cinemaId, input.id, input.body),
    onSuccess: () => {
      toast.success(t("admin.screens.update_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.screens.generic_error"))
  });

  const removeMutation = useLTTMutation<boolean, string>({
    mutationFn: async (id) => {
      if (!selectedCinemaId) return true;
      await screenService.deleteScreenAsync(selectedCinemaId, id);
      return true;
    },
    onSuccess: () => {
      toast.success(t("admin.screens.delete_success"));
    },
    onError: (err) => toast.error(err.message || t("admin.screens.generic_error"))
  });

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || removeMutation.isLoading;
  const saveLoading = createMutation.isLoading || updateMutation.isLoading;
  const selectedSeatMap = seatMaps.find((x) => x.id === form.seatMapId);
  const effectiveSeatLayout = form.seatLayout || selectedSeatMap?.seatLayout || "";
  const parsedSelectedSeatLayout = useMemo(() => {
    if (!effectiveSeatLayout) return null;
    try {
      return JSON.parse(effectiveSeatLayout) as { rows?: unknown[] };
    } catch {
      return null;
    }
  }, [effectiveSeatLayout]);

  const seatMapListMutation = useLTTMutation<PagedResultDto<SeatMapOutputDto> | undefined, { cinemaId: string; page: number; fetch: number; keyword?: string }>({
    mutationFn: ({ cinemaId, page, fetch, keyword }) => seatMapService.getSeatMapListAsync(cinemaId, { page, fetch, keyword }),
    onSuccess: (res) => setSeatMaps(res?.items || []),
    onError: (err) => toast.error(err.message || t("admin.seatmap.fetch_error"))
  });

  const seatTypeListMutation = useLTTMutation<PagedResultDto<SeatTypeOutputDto> | undefined, { page: number; fetch: number; keyword?: string }>({
    mutationFn: (params) => managerSeatTypeService.getSeatTypeListAsync(params),
    onSuccess: (res) => {
      const mapped = (res?.items || []).map((item, idx) => {
        const direction = (item.displayDirection || "").toLowerCase();
        const orientation: SeatType["orientation"] =
          direction.includes("horizontal")
            ? "horizontal"
            : direction.includes("vertical")
              ? "vertical"
              : "square";
        return {
          id: idx + 1,
          name: item.name,
          description: item.description || "",
          priceMultiplier: item.priceMultiplier,
          seatOccupied: item.numberOfSeat > 0 ? item.numberOfSeat : 1,
          orientation,
          createdAt: "",
          updatedAt: item.updatedAt || "",
        };
      });
      setSeatTypes(mapped);
    },
    onError: (err) => toast.error(err.message || t("admin.screens.seat_type_fetch_error"))
  });

  const fetchData = (keyword?: string, pageNumber?: number) => {
    if (!selectedCinemaId) return;
    const effectiveKeyword = keyword ?? debouncedSearch;
    const effectivePage = pageNumber ?? page;
    listMutation.mutation({ cinemaId: selectedCinemaId, params: { page: effectivePage, fetch, keyword: effectiveKeyword } });
  };

  useEffect(() => {
    let isCancelled = false;

    const resolveManagerCinemaAsync = async () => {
      const accessToken = getCookie(ADMIN_ACCESS_TOKEN_KEY);
      const userInfo = accessToken ? getUserInfoFromToken(accessToken) : null;
      const claimCinemaId = userInfo?.cinemaId?.trim() || "";

      if (claimCinemaId) {
        if (!isCancelled) {
          setSelectedCinemaId(claimCinemaId);
          setCinemaMissing(false);
        }
        return;
      }

      try {
        const cinemaResult = await cinemaService.getCinemaListAsync({ page: 1, fetch: 1 });
        const fallbackCinemaId = cinemaResult?.items?.[0]?.id?.trim() || "";
        if (!fallbackCinemaId) {
          if (!isCancelled) {
            setCinemaMissing(true);
            toast.error(t("admin.screens.cinema_claim_missing"));
          }
          return;
        }

        if (!isCancelled) {
          setSelectedCinemaId(fallbackCinemaId);
          setCinemaMissing(false);
        }
      } catch {
        if (!isCancelled) {
          setCinemaMissing(true);
          toast.error(t("admin.screens.cinema_claim_missing"));
        }
      }
    };

    resolveManagerCinemaAsync();
    return () => {
      isCancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (selectedCinemaId) {
      fetchData(debouncedSearch, page);
    }
  }, [selectedCinemaId, page, fetch, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const allSel = items.length > 0 && items.every((i) => selected.has(i.id));
  const toggleAll = () =>
    allSel ? setSelected(new Set()) : setSelected(new Set(items.map((i) => i.id)));
  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      screenNumber: 1,
      screenType: "2D",
      seatCount: 0,
      seatMapId: "",
      seatLayout: "",
      status: "active",
    });
    setCreatedSeatMapId("");
    setDialogOpen(true);
    if (selectedCinemaId) {
      seatMapListMutation.mutation({ cinemaId: selectedCinemaId, page: 1, fetch: 200 });
    }
  };

  const openEdit = (item: ScreenOutputDto) => {
    setEditing(item);
    setForm({
      screenNumber: item.screenNumber,
      screenType: item.screenType || "2D",
      seatCount: item.seatCount || 0,
      seatMapId: "",
      seatLayout: item.seatLayout || "",
      status: item.status || "active",
    });
    setCreatedSeatMapId("");
    setDialogOpen(true);
    if (selectedCinemaId) {
      seatMapListMutation.mutation({ cinemaId: selectedCinemaId, page: 1, fetch: 200 });
    }
  };

  // When seat maps load (or change) while editing, try to match the screen's snapshot
  // layout against an existing seat map so the dropdown reflects the originating template.
  useEffect(() => {
    if (!editing || !form.seatLayout) return;
    if (form.seatMapId) return;
    const matched = seatMaps.find((m) => (m.seatLayout || "") === form.seatLayout);
    if (matched) {
      setForm((prev) => ({ ...prev, seatMapId: matched.id }));
    }
  }, [editing, seatMaps, form.seatLayout, form.seatMapId]);

  const save = async () => {
    if (!selectedCinemaId) {
      toast.error(t("admin.screens.validation.cinema_required"));
      return;
    }

    if (form.screenNumber <= 0) {
      toast.error(t("admin.screens.validation.screen_number_invalid"));
      return;
    }

    const layoutFromPick = selectedSeatMap?.seatLayout || "";
    const seatCountFromPick = selectedSeatMap?.seatCount || 0;
    const layoutToSend = layoutFromPick || form.seatLayout;
    const seatCountToSend = seatCountFromPick || form.seatCount;

    if (!layoutToSend) {
      toast.error(t("admin.screens.validation.seat_map_required"));
      return;
    }

    if (seatCountToSend <= 0) {
      toast.error(t("admin.screens.validation.seat_count_invalid"));
      return;
    }

    const body: CreateScreenInputDto | UpdateScreenInputDto = {
      screenNumber: form.screenNumber,
      screenType: form.screenType,
      status: form.status,
      seatLayout: layoutToSend,
      seatCount: seatCountToSend,
    };

    if (editing) {
      updateMutation.mutation({ cinemaId: selectedCinemaId, id: editing.id, body });
    } else {
      createMutation.mutation({ cinemaId: selectedCinemaId, body });
    }
  };

  const handleSeatMapDesigned = async (payload: Screen) => {
    if (!selectedCinemaId) return;
    const created = await seatMapService.createSeatMapAsync(selectedCinemaId, {
      name: payload.name || `Seat map ${Date.now()}`,
      description: payload.description,
      seatLayout: JSON.stringify(payload.seatLayout),
      seatCount: payload.seatCount,
    });
    setCreatedSeatMapId(created.id);
    setForm((prev) => ({
      ...prev,
      seatMapId: created.id,
      seatLayout: created.seatLayout || "",
      seatCount: created.seatCount || prev.seatCount,
    }));
    setDesignDialogOpen(false);
    if (selectedCinemaId) {
      seatMapListMutation.mutation({ cinemaId: selectedCinemaId, page: 1, fetch: 200 });
    }
  };

  const handleOpenDesignDialog = () => {
    seatTypeListMutation.mutation({ page: 1, fetch: 200 });
    setDesignDialogOpen(true);
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      return;
    }

    const results = await Promise.allSettled(
      ids.map((id) => screenService.deleteScreenAsync(selectedCinemaId, id))
    );
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed === 0) {
      toast.success(t("admin.screens.bulk_delete_success", { count: ids.length }));
    } else {
      toast.error(t("admin.screens.bulk_delete_partial", { success: ids.length - failed, total: ids.length }));
    }

    setSelected(new Set());
    setDeleteOpen(false);
    fetchData(debouncedSearch);
  };

  const confirmDeleteOne = async () => {
    if (!deleteTargetId) return;
    await removeMutation.mutation(deleteTargetId);
    setSingleDeleteOpen(false);
    setDeleteTargetId("");
    fetchData(debouncedSearch);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.screens.title")}</h1>
        <LTTButton onClick={openCreate} className="gap-2" disabled={!selectedCinemaId || cinemaMissing}>
          <Plus className="h-4 w-4" /> {t("admin.screens.add")}
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.screens.search_placeholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        {selected.size > 0 && (
          <LTTButton
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> {t("admin.screens.bulk_delete_button", { count: selected.size })}
          </LTTButton>
        )}
        <LTTButton
          variant="outline"
          className="gap-2"
          onClick={() => {
            if (page !== 1) {
              setPage(1);
              return;
            }
            fetchData(debouncedSearch, 1);
          }}
          loading={listMutation.isLoading}
        >
          <RefreshCw className="h-4 w-4" /> {t("admin.screens.refresh")}
        </LTTButton>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSel} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.screens.table.screen_number")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.screens.table.screen_type")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.screens.table.seat_count")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.screens.table.seat_layout")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.screens.table.status")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("admin.screens.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <DomainTableStateRow colSpan={7} state="loading" loadingText={t("admin.screens.state.loading")} />
            ) : items.length === 0 ? (
              <DomainTableStateRow colSpan={7} state="empty" emptyText={t("admin.screens.state.empty")} />
            ) : (
              items.map((item) => (
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
                  <td className="px-4 py-3 font-medium">{t("admin.screens.table.screen_label", { number: item.screenNumber })}</td>
                  <td className="px-4 py-3">{item.screenType}</td>
                  <td className="px-4 py-3">{item.seatCount}</td>
                  <td className="px-4 py-3">
                    {item.seatLayout
                      ? t("admin.screens.table.layout_configured")
                      : t("admin.screens.status.empty")}
                  </td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={`font-medium ${statusColors[item.status || "active"] || statusColors.active}`}
                    >
                      {item.status === "active"
                        ? t("admin.screens.status.active")
                        : item.status === "maintenance"
                          ? t("admin.screens.status.maintenance")
                          : t("admin.screens.status.inactive")}
                    </LTTBadge>
                  </td>
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
                          setDeleteTargetId(item.id);
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

      <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LTTDialogContent className="sm:max-w-6xl">
          <LTTDialogHeader>
            <LTTDialogTitle>{editing ? t("admin.screens.form.edit_title") : t("admin.screens.form.create_title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid max-h-[80vh] gap-4 overflow-y-auto py-2 pr-1 sm:grid-cols-2">
            <div className="space-y-2">
              <LTTLabel>{t("admin.screens.form.screen_number")}</LTTLabel>
              <LTTInput
                type="number"
                value={form.screenNumber}
                onChange={(e) => setForm({ ...form, screenNumber: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.screens.form.screen_type")}</LTTLabel>
              <LTTSelect value={form.screenType} onValueChange={(v: string) => setForm({ ...form, screenType: v })}>
                <LTTSelectTrigger><LTTSelectValue /></LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="2D">2D</LTTSelectItem>
                  <LTTSelectItem value="3D">3D</LTTSelectItem>
                  <LTTSelectItem value="IMAX">IMAX</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.screens.form.status")}</LTTLabel>
              <LTTSelect value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v })}>
                <LTTSelectTrigger><LTTSelectValue /></LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="active">{t("admin.screens.status.active")}</LTTSelectItem>
                  <LTTSelectItem value="maintenance">{t("admin.screens.status.maintenance")}</LTTSelectItem>
                  <LTTSelectItem value="inactive">{t("admin.screens.status.inactive")}</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>{t("admin.screens.form.seat_map")}</LTTLabel>
              <div className="flex flex-wrap gap-2">
                <LTTSelect
                  value={form.seatMapId}
                  onValueChange={(v: string) => {
                    const picked = seatMaps.find((m) => m.id === v);
                    setForm((prev) => ({
                      ...prev,
                      seatMapId: v,
                      seatLayout: picked?.seatLayout || "",
                      seatCount: picked?.seatCount || 0,
                    }));
                  }}
                >
                  <LTTSelectTrigger className="min-w-[220px]"><LTTSelectValue placeholder={t("admin.screens.form.seat_map_placeholder")} /></LTTSelectTrigger>
                  <LTTSelectContent>
                    {seatMaps.map((map) => (
                      <LTTSelectItem key={map.id} value={map.id}>{map.name}</LTTSelectItem>
                    ))}
                  </LTTSelectContent>
                </LTTSelect>
                <LTTButton variant="outline" onClick={handleOpenDesignDialog}>
                  {t("admin.screens.form.design_new")}
                </LTTButton>
                <LTTButton
                  variant="outline"
                  className="gap-2"
                  onClick={() => seatTypeListMutation.mutation({ page: 1, fetch: 200 })}
                  loading={seatTypeListMutation.isLoading}
                >
                  <RefreshCw className="h-4 w-4" /> {t("admin.screens.form.refresh_seat_types")}
                </LTTButton>
                <LTTButton
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    if (!selectedCinemaId) return;
                    seatMapListMutation.mutation({
                      cinemaId: selectedCinemaId,
                      page: 1,
                      fetch: 200,
                    });
                  }}
                  loading={seatMapListMutation.isLoading}
                >
                  <RefreshCw className="h-4 w-4" /> {t("admin.screens.form.refresh_seat_maps")}
                </LTTButton>
              </div>
              {createdSeatMapId && <p className="text-xs text-muted-foreground-shadcn">{t("admin.screens.form.created_seatmap_hint")}</p>}
              {editing && form.seatLayout && !form.seatMapId && (
                <p className="text-xs text-muted-foreground-shadcn">{t("admin.screens.form.custom_snapshot_hint")}</p>
              )}
            </div>
            {(selectedSeatMap || (editing && form.seatLayout)) && (
              <div className="space-y-2 sm:col-span-2 rounded-md border border-border-shadcn p-3">
                <div className="flex items-center justify-between">
                  <LTTLabel>{t("admin.screens.form.preview_title")}</LTTLabel>
                  <span className="text-xs text-muted-foreground-shadcn">
                    {selectedSeatMap?.name ?? t("admin.screens.form.custom_snapshot_label")}
                  </span>
                </div>
                {parsedSelectedSeatLayout ? (
                  <div className="max-h-[480px] overflow-auto">
                    <LTTSeatMapViewer
                      seatLayout={parsedSelectedSeatLayout as any}
                      readOnly
                      showScreen
                      showLegend
                    />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground-shadcn">
                    {t("admin.screens.form.preview_unavailable")}
                  </p>
                )}
              </div>
            )}
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.screens.form.cancel")}</LTTButton>
            <LTTButton onClick={save} loading={saveLoading} disabled={!selectedCinemaId || saveLoading}>
              {editing ? t("admin.screens.form.save") : t("admin.screens.form.create")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
      {designDialogOpen && (
        <LTTScreenCreateWizard
          onClose={() => setDesignDialogOpen(false)}
          onCreated={handleSeatMapDesigned}
          fixedCinemaId={selectedCinemaId}
          entityType="seatmap"
          isSubmitting={false}
          seatTypes={seatTypes}
        />
      )}

      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.screens.delete_confirm.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              {t("admin.screens.delete_confirm.bulk_message", { count: selected.size })}
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>{t("admin.screens.delete_confirm.cancel")}</LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete}>{t("admin.screens.delete_confirm.confirm")}</LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
      <LTTDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.screens.delete_confirm.single_title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">{t("admin.screens.delete_confirm.single_message")}</p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setSingleDeleteOpen(false)}>{t("admin.screens.delete_confirm.cancel")}</LTTButton>
            <LTTButton variant="destructive" onClick={confirmDeleteOne}>{t("admin.screens.delete_confirm.delete")}</LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}
