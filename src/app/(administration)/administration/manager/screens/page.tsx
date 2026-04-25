"use client";

import { useState, useEffect } from "react";
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
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";
import { getCookie } from "@/src/@core/utils/cookie";
import { ADMIN_ACCESS_TOKEN_KEY } from "@/src/@core/const";
import { getUserInfoFromToken } from "@/src/@core/utils/jwt";
import { useLocalization } from "@/src/@core/hooks/use-localization";

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

  const [form, setForm] = useState({
    screenNumber: 1,
    screenType: "2D",
    seatCount: 100,
    seatLayout: "Standard",
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

  const fetchData = (keyword?: string, pageNumber?: number) => {
    if (!selectedCinemaId) return;
    const effectiveKeyword = keyword ?? debouncedSearch;
    const effectivePage = pageNumber ?? page;
    listMutation.mutation({ cinemaId: selectedCinemaId, params: { page: effectivePage, fetch, keyword: effectiveKeyword } });
  };

  useEffect(() => {
    const accessToken = getCookie(ADMIN_ACCESS_TOKEN_KEY);
    const userInfo = accessToken ? getUserInfoFromToken(accessToken) : null;
    const cinemaId = userInfo?.cinemaId?.trim() || "";
    if (!cinemaId) {
      setCinemaMissing(true);
      toast.error(t("admin.screens.cinema_claim_missing"));
      return;
    }
    setSelectedCinemaId(cinemaId);
  }, []);

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
      seatCount: 100,
      seatLayout: "Standard",
      status: "active",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: ScreenOutputDto) => {
    setEditing(item);
    setForm({
      screenNumber: item.screenNumber,
      screenType: item.screenType || "2D",
      seatCount: item.seatCount,
      seatLayout: item.seatLayout || "Standard",
      status: item.status || "active",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!selectedCinemaId) {
      toast.error(t("admin.screens.validation.cinema_required"));
      return;
    }

    if (form.screenNumber <= 0) {
      toast.error(t("admin.screens.validation.screen_number_invalid"));
      return;
    }

    if (editing) {
      updateMutation.mutation({ cinemaId: selectedCinemaId, id: editing.id, body: form });
    } else {
      createMutation.mutation({ cinemaId: selectedCinemaId, body: form });
    }
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
            <Trash2 className="h-4 w-4" /> Xóa {selected.size}
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

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSel} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Phòng chiếu số</th>
              <th className="px-4 py-3 text-left font-semibold">Loại màn hình</th>
              <th className="px-4 py-3 text-left font-semibold">Số lượng ghế</th>
              <th className="px-4 py-3 text-left font-semibold">Bố trí ghế</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <DomainTableStateRow colSpan={7} state="loading" loadingText="Đang tải dữ liệu phòng chiếu..." />
            ) : items.length === 0 ? (
              <DomainTableStateRow colSpan={7} state="empty" emptyText="Không có dữ liệu phòng chiếu nào." />
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
                  <td className="px-4 py-3 font-medium">Phòng {item.screenNumber}</td>
                  <td className="px-4 py-3">{item.screenType}</td>
                  <td className="px-4 py-3">{item.seatCount}</td>
                  <td className="px-4 py-3">{item.seatLayout}</td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={`font-medium ${statusColors[item.status || "active"] || statusColors.active}`}
                    >
                      {item.status === "active" ? "Hoạt động" : item.status === "maintenance" ? "Bảo trì" : "Trống"}
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
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>{editing ? "Chỉnh sửa phòng chiếu" : "Thêm phòng chiếu mới"}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <LTTLabel>Phòng chiếu số *</LTTLabel>
              <LTTInput
                type="number"
                value={form.screenNumber}
                onChange={(e) => setForm({ ...form, screenNumber: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Loại màn hình *</LTTLabel>
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
              <LTTLabel>Số lượng ghế *</LTTLabel>
              <LTTInput
                type="number"
                value={form.seatCount}
                onChange={(e) => setForm({ ...form, seatCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Trạng thái</LTTLabel>
              <LTTSelect value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v })}>
                <LTTSelectTrigger><LTTSelectValue /></LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="active">Hoạt động</LTTSelectItem>
                  <LTTSelectItem value="maintenance">Bảo trì</LTTSelectItem>
                  <LTTSelectItem value="inactive">Không hoạt động</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Bố trí ghế (Tên sơ đồ)</LTTLabel>
              <LTTInput
                value={form.seatLayout}
                onChange={(e) => setForm({ ...form, seatLayout: e.target.value })}
              />
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>Hủy</LTTButton>
            <LTTButton onClick={save} disabled={!selectedCinemaId || createMutation.isLoading || updateMutation.isLoading}>
              {editing ? "Lưu" : "Tạo mới"}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> phòng chiếu đã chọn? Hành động này không thể hoàn tác.
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete}>Xác nhận xóa</LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
      <LTTDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa phòng chiếu</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">Bạn có chắc chắn muốn xóa phòng chiếu này?</p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setSingleDeleteOpen(false)}>Hủy</LTTButton>
            <LTTButton variant="destructive" onClick={confirmDeleteOne}>Xóa</LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}
