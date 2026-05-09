"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  Eye,
  Pencil,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import { LTTDialog } from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import {
  LTTDialogContent,
  LTTDialogHeader,
  LTTDialogTitle,
  LTTDialogFooter,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";

import {
  type Screen,
} from "@/src/@core/const/mock/adminMockData";
import LTTScreenCreateWizard from "@/src/@core/component/LTTManager/LTTScreenCreateWizard";
import LTTSeatMapViewer from "@/src/@core/component/LTTManager/LTTSeatMapViewer";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { seatMapService } from "@/src/services/administration-service/seat-map/seat-map.service";
import { SeatMapOutputDto } from "@/src/services/administration-service/seat-map/models/output.model";
import { managerSeatTypeService } from "@/src/services/administration-service/manager/seat-type/seat-type.service";
import { SeatTypeOutputDto } from "@/src/services/administration-service/seat-type/models/output.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import { getCookie } from "@/src/@core/utils/cookie";
import { ADMIN_ACCESS_TOKEN_KEY } from "@/src/@core/const";
import { getUserInfoFromToken } from "@/src/@core/utils/jwt";
import { formatDateTimeValueGmt7 } from "@/src/@core/utils/date";
import { SeatType } from "@/src/@core/const/mock/adminMockData";
import { cinemaService } from "@/src/services/administration-service/cinema/cinema.service";


export default function SeatMapPage() {
  const { t } = useLocalization();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [cinemaMissing, setCinemaMissing] = useState(false);
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState("");
  const [viewLayout, setViewLayout] = useState<Screen | null>(null);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);

  // Master-detail view state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);

  const mapToWizardScreen = (item: SeatMapOutputDto): Screen => ({
    id: item.id,
    tenantId: "",
    cinemaId: item.cinemaId,
    seatMapId: item.id,
    name: item.name,
    description: item.description,
    screenNumber: 0,
    screenType: "2D",
    seatLayout: item.seatLayout ? JSON.parse(item.seatLayout) : { rows: [] },
    seatCount: item.seatCount,
    createdAt: formatDateTimeValueGmt7(item.createdAt),
    updatedAt: formatDateTimeValueGmt7(item.updatedAt),
  });

  const listMutation = useLTTMutation<PagedResultDto<SeatMapOutputDto> | undefined, { cinemaId: string; page: number; fetch: number; keyword?: string }>({
    mutationFn: ({ cinemaId, page, fetch, keyword }) => seatMapService.getSeatMapListAsync(cinemaId, { page, fetch, keyword }),
    onSuccess: (res) => {
      setScreens((res?.items || []).map(mapToWizardScreen));
      setTotalCount(res?.totalCount || 0);
    },
    onError: (err) => toast.error(err.message || t("admin.seatmap.fetch_error")),
  });

  const createMutation = useLTTMutation({
    mutationFn: (payload: Screen) => seatMapService.createSeatMapAsync(payload.cinemaId, {
      name: payload.name || "",
      description: payload.description,
      seatCount: payload.seatCount,
      seatLayout: JSON.stringify(payload.seatLayout),
    }),
    onSuccess: () => {
      toast.success(t("admin.seatmap.create_success"));
      setIsEditorOpen(false);
      setEditingScreen(null);
      fetchData();
    },
  });

  const updateMutation = useLTTMutation({
    mutationFn: (payload: Screen) => seatMapService.updateSeatMapAsync(payload.id, {
      name: payload.name || "",
      description: payload.description,
      seatCount: payload.seatCount,
      seatLayout: JSON.stringify(payload.seatLayout),
    }),
    onSuccess: () => {
      toast.success(t("admin.seatmap.update_success"));
      setIsEditorOpen(false);
      setEditingScreen(null);
      fetchData();
    },
  });

  const deleteMutation = useLTTMutation({
    mutationFn: (id: string) => seatMapService.deleteSeatMapAsync(id),
  });

  const singleDeleteMutation = useLTTMutation<void, string>({
    mutationFn: (id: string) => seatMapService.deleteSeatMapAsync(id),
    onSuccess: () => {
      toast.success(t("admin.seatmap.delete_success"));
      setSingleDeleteOpen(false);
      setSingleDeleteId("");
      fetchData();
    },
    onError: (err) => toast.error(err.message || t("admin.seatmap.fetch_error")),
  });

  const seatTypeMutation = useLTTMutation<PagedResultDto<SeatTypeOutputDto> | undefined, { page: number; fetch: number; keyword?: string }>({
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
        const normalizedId = Number(item.id);
        return {
          id: Number.isFinite(normalizedId) ? normalizedId : idx + 1,
          name: item.name,
          description: item.description || "",
          priceMultiplier: item.priceMultiplier,
          seatOccupied: item.numberOfSeat > 0 ? item.numberOfSeat : 1,
          orientation,
          seatColor: item.seatColor,
          createdAt: "",
          updatedAt: item.updatedAt || "",
        };
      });
      setSeatTypes(mapped);
    },
    onError: (err) => toast.error(err.message || t("admin.seatmap.seat_type_fetch_error")),
  });

  const fetchData = (keyword?: string, pageNumber?: number) => {
    if (!selectedCinemaId) return;
    listMutation.mutation({ cinemaId: selectedCinemaId, page: pageNumber ?? page, fetch, keyword: keyword ?? debouncedSearch });
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
            toast.error(t("admin.seatmap.cinema_claim_missing"));
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
          toast.error(t("admin.seatmap.cinema_claim_missing"));
        }
      }
    };

    resolveManagerCinemaAsync();
    return () => {
      isCancelled = true;
    };
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedCinemaId) fetchData(debouncedSearch, page);
  }, [selectedCinemaId, page, fetch, debouncedSearch]);

  const filtered = useMemo(() => {
    return screens;
  }, [screens]);

  const allSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleDeleteSelected = () => {
    Promise.allSettled(Array.from(selected).map((id) => deleteMutation.mutation(id))).then(() => {
      toast.success(t("admin.seatmap.bulk_delete_success", { count: selected.size }));
      setSelected(new Set());
      setDeleteDialogOpen(false);
      fetchData();
    });
  };

  const confirmSingleDelete = () => {
    if (!singleDeleteId) return;
    singleDeleteMutation.mutation(singleDeleteId);
  };

  const handleScreenCreated = (screen: Screen) => {
    createMutation.mutation(screen);
  };

  const handleScreenUpdated = (screen: Screen) => {
    updateMutation.mutation(screen);
  };

  const handleOpenEditor = (screen?: Screen) => {
    seatTypeMutation.mutation({ page: 1, fetch: 200 });
    setEditingScreen(screen ?? null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingScreen(null);
  };

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.seatmap.title")}</h1>
        <LTTButton onClick={() => handleOpenEditor()} className="gap-2" disabled={!selectedCinemaId || cinemaMissing}>
          <Plus className="h-4 w-4" /> {t("admin.seatmap.add")}
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.seatmap.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
          <RefreshCw className="h-4 w-4" /> {t("admin.seatmap.refresh")}
        </LTTButton>

        {selected.size > 0 && (
          <LTTButton
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> {t("admin.seatmap.bulk_delete_button", { count: selected.size })}
          </LTTButton>
        )}
      </div>
      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden my-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seatmap.table.index")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seatmap.table.name")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seatmap.table.description")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seatmap.table.seat_count")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seatmap.table.created_at")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seatmap.table.updated_at")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("admin.seatmap.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {listMutation.isLoading ? (
              <DomainTableStateRow colSpan={9} state="loading" loadingText={t("admin.seatmap.table.loading")} />
            ) : filtered.length === 0 ? (
              <DomainTableStateRow colSpan={9} state="empty" emptyText={t("admin.seatmap.table.empty")} />
            ) : (
              filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors"
                >
                  <td className="px-3 py-3">
                    <LTTCheckbox
                      checked={selected.has(item.id)}
                      onCheckedChange={() => toggleOne(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{item.name || "—"}</td>
                  <td className="px-4 py-3">{item.description || "—"}</td>
                  <td className="px-4 py-3">{item.seatCount}</td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {formatDateTimeValueGmt7(item.createdAt) || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {formatDateTimeValueGmt7(item.updatedAt) || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={t("admin.seatmap.actions.view")}
                        onClick={() => setViewLayout(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={t("admin.seatmap.actions.edit")}
                        onClick={() => handleOpenEditor(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title={t("admin.seatmap.actions.delete")}
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

      {/* Bulk Delete Dialog */}
      <LTTDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.seatmap.delete_dialog.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("admin.seatmap.delete_dialog.message", { count: selected.size })}
          </p>
          <LTTDialogFooter>
            <LTTButton
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("admin.seatmap.delete_dialog.cancel")}
            </LTTButton>
            <LTTButton variant="destructive" onClick={handleDeleteSelected}>
              {t("admin.seatmap.delete_dialog.confirm")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      {/* Single row delete — matches screens / other manager tables */}
      <LTTDialog
        open={singleDeleteOpen}
        onOpenChange={(open) => {
          setSingleDeleteOpen(open);
          if (!open) setSingleDeleteId("");
        }}
      >
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.seatmap.delete_dialog.single_title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">{t("admin.seatmap.delete_dialog.single_message")}</p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setSingleDeleteOpen(false)}>
              {t("admin.seatmap.delete_dialog.cancel")}
            </LTTButton>
            <LTTButton
              variant="destructive"
              onClick={confirmSingleDelete}
              loading={singleDeleteMutation.isLoading}
            >
              {t("admin.seatmap.delete_dialog.confirm")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      {/* View Layout Dialog */}
      <LTTDialog
        open={!!viewLayout}
        onOpenChange={() => setViewLayout(null)}
      >
        <LTTDialogContent className="sm:max-w-3xl">
          <LTTDialogHeader>
            <LTTDialogTitle>
              {t("admin.seatmap.viewer.title")} — {viewLayout?.name || t("admin.seatmap.viewer.fallback_name")}
            </LTTDialogTitle>
          </LTTDialogHeader>

          {viewLayout && (
            <div className="space-y-6 py-2 overflow-y-auto max-h-[75vh]">
              <LTTSeatMapViewer
                seatLayout={viewLayout.seatLayout}
                readOnly
                showScreen
                showLegend
              />
              <p className="text-center text-xs text-muted-foreground">
                {t("admin.seatmap.viewer.total_seats")}: <strong>{viewLayout.seatCount}</strong>
              </p>
            </div>
          )}
        </LTTDialogContent>
      </LTTDialog>
    </div>
    
    {isEditorOpen && (
      <LTTScreenCreateWizard
        key={editingScreen?.id ?? "new"}
        onClose={handleCloseEditor}
        onCreated={handleScreenCreated}
        onUpdate={handleScreenUpdated}
        initialData={editingScreen ?? undefined}
        fixedCinemaId={selectedCinemaId}
        entityType="seatmap"
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
        seatTypes={seatTypes}
      />
    )}
  </>
  );
}
