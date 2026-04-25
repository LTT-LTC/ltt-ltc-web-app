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
import { screenService } from "@/src/services/administration-service/screen/screen.service";
import { ScreenOutputDto } from "@/src/services/administration-service/screen/models/output.model";
import { CinemaOutputDto, cinemaService } from "@/src/services/administration-service/cinema/cinema.service";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
  LTTSelect,
  LTTSelectContent,
  LTTSelectItem,
  LTTSelectTrigger,
  LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";
import { useLocalization } from "@/src/@core/hooks/use-localization";


export default function SeatMapPage() {
  const { t } = useLocalization();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [cinemas, setCinemas] = useState<CinemaOutputDto[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewLayout, setViewLayout] = useState<Screen | null>(null);

  // Master-detail view state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);

  const mapToWizardScreen = (item: ScreenOutputDto): Screen => ({
    id: item.id,
    tenantId: "",
    cinemaId: item.cinemaId,
    screenNumber: item.screenNumber,
    screenType: item.screenType || "2D",
    seatLayout: item.seatLayout ? JSON.parse(item.seatLayout) : { rows: [] },
    seatCount: item.seatCount,
    createdAt: "",
    updatedAt: "",
  });

  const cinemaMutation = useLTTMutation<PagedResultDto<CinemaOutputDto> | undefined, { page: number; fetch: number }>({
    mutationFn: (p) => cinemaService.getCinemaListAsync(p),
    onSuccess: (res) => {
      if (!res?.items) return;
      setCinemas(res.items);
      if (!selectedCinemaId && res.items[0]?.id) {
        setSelectedCinemaId(res.items[0].id);
      }
    },
  });

  const listMutation = useLTTMutation<PagedResultDto<ScreenOutputDto> | undefined, { cinemaId: string; page: number; fetch: number; keyword?: string }>({
    mutationFn: ({ cinemaId, page, fetch, keyword }) => screenService.getScreenListAsync(cinemaId, { page, fetch, keyword }),
    onSuccess: (res) => {
      setScreens((res?.items || []).map(mapToWizardScreen));
      setTotalCount(res?.totalCount || 0);
    },
    onError: (err) => toast.error(err.message || t("admin.seatmap.fetch_error")),
  });

  const createMutation = useLTTMutation({
    mutationFn: (payload: Screen) => screenService.createScreenAsync(payload.cinemaId, {
      screenNumber: payload.screenNumber,
      screenType: payload.screenType,
      seatCount: payload.seatCount,
      seatLayout: JSON.stringify(payload.seatLayout),
      status: "active",
    }),
    onSuccess: () => {
      toast.success(t("admin.seatmap.create_success"));
      setIsEditorOpen(false);
      setEditingScreen(null);
      fetchData();
    },
  });

  const updateMutation = useLTTMutation({
    mutationFn: (payload: Screen) => screenService.updateScreenAsync(payload.cinemaId, payload.id, {
      screenNumber: payload.screenNumber,
      screenType: payload.screenType,
      seatCount: payload.seatCount,
      seatLayout: JSON.stringify(payload.seatLayout),
      status: "active",
    }),
    onSuccess: () => {
      toast.success(t("admin.seatmap.update_success"));
      setIsEditorOpen(false);
      setEditingScreen(null);
      fetchData();
    },
  });

  const deleteMutation = useLTTMutation({
    mutationFn: (id: string) => screenService.deleteScreenAsync(selectedCinemaId, id),
  });

  const fetchData = (keyword?: string, pageNumber?: number) => {
    if (!selectedCinemaId) return;
    listMutation.mutation({ cinemaId: selectedCinemaId, page: pageNumber ?? page, fetch, keyword: keyword ?? debouncedSearch });
  };

  useEffect(() => {
    cinemaMutation.mutation({ page: 1, fetch: 100 });
  }, []);

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

  const handleDeleteOne = (id: string) => {
    deleteMutation.mutation(id).then(() => {
      toast.success(t("admin.seatmap.delete_success"));
      fetchData();
    });
  };

  const handleScreenCreated = (screen: Screen) => {
    createMutation.mutation(screen);
  };

  const handleScreenUpdated = (screen: Screen) => {
    updateMutation.mutation(screen);
  };

  const handleOpenEditor = (screen?: Screen) => {
    setEditingScreen(screen ?? null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingScreen(null);
  };

  const getCinemaName = (id: string) =>
    cinemas.find((c) => c.id === id)?.name || id;

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.seatmap.title")}</h1>
        <LTTButton onClick={() => handleOpenEditor()} className="gap-2">
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
        <LTTSelect
          value={selectedCinemaId}
          onValueChange={(v) => {
            setSelectedCinemaId(v);
            setPage(1);
          }}
        >
          <LTTSelectTrigger className="w-56">
            <LTTSelectValue placeholder="Chọn rạp" />
          </LTTSelectTrigger>
          <LTTSelectContent>
            {cinemas.map((c) => (
              <LTTSelectItem key={c.id} value={c.id}>
                {c.name}
              </LTTSelectItem>
            ))}
          </LTTSelectContent>
        </LTTSelect>
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
            <Trash2 className="h-4 w-4" /> Xóa {selected.size} mục
          </LTTButton>
        )}
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

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">STT</th>
              <th className="px-4 py-3 text-left font-semibold">Rạp</th>
              <th className="px-4 py-3 text-left font-semibold">Phòng số</th>
              <th className="px-4 py-3 text-left font-semibold">Loại phòng</th>
              <th className="px-4 py-3 text-left font-semibold">Số ghế</th>
              <th className="px-4 py-3 text-left font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {listMutation.isLoading ? (
              <DomainTableStateRow colSpan={9} state="loading" loadingText="Đang tải dữ liệu sơ đồ ghế..." />
            ) : filtered.length === 0 ? (
              <DomainTableStateRow colSpan={9} state="empty" emptyText="Không có dữ liệu" />
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
                  <td className="px-4 py-3 font-medium">
                    {getCinemaName(item.cinemaId)}
                  </td>
                  <td className="px-4 py-3">Phòng {item.screenNumber}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-accent-shadcn px-2.5 py-0.5 text-xs font-medium text-accent-shadcn-foreground">
                      {item.screenType}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.seatCount}</td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {item.createdAt}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {item.updatedAt}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Xem sơ đồ"
                        onClick={() => setViewLayout(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Chỉnh sửa"
                        onClick={() => handleOpenEditor(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Xóa"
                        onClick={() => handleDeleteOne(item.id)}
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

      {/* Bulk Delete Dialog */}
      <LTTDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa</LTTDialogTitle>
          </LTTDialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa{" "}
            <strong>{selected.size}</strong> phòng chiếu? Hành động này không thể
            hoàn tác.
          </p>
          <LTTDialogFooter>
            <LTTButton
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </LTTButton>
            <LTTButton variant="destructive" onClick={handleDeleteSelected}>
              Xóa
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
              Sơ đồ ghế — Phòng {viewLayout?.screenNumber} ({viewLayout?.screenType})
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
                Tổng ghế: <strong>{viewLayout.seatCount}</strong>
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
      />
    )}
  </>
  );
}
