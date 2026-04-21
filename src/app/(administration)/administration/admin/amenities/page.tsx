"use client";

import { useState, useMemo, useEffect } from "react";
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
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
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
import useDebouncedListQuery from "@/src/@core/hooks/useDebouncedListQuery";
import { cinemaAmenityService } from "@/src/services/administration-service/cinema-amenity/cinema-amenity.service";
import { cinemaService } from "@/src/services/administration-service/cinema/cinema.service";
import { CinemaAmenityOutputDto } from "@/src/services/administration-service/cinema-amenity/models/output.model";
import { GetCinemaAmenityListInputDto, CreateCinemaAmenityInputDto, UpdateCinemaAmenityInputDto } from "@/src/services/administration-service/cinema-amenity/models/input.model";
import { CinemaOutputDto } from "@/src/services/administration-service/cinema/models/output.model";
import { GetCinemaListInputDto } from "@/src/services/administration-service/cinema/models/input.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-red-100 text-red-700 border-red-200",
};

export default function CinemaAmenitiesAdminPage() {

  const [cinemas, setCinemas] = useState<CinemaOutputDto[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");

  const [items, setItems] = useState<CinemaAmenityOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [editing, setEditing] = useState<CinemaAmenityOutputDto | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    amenityTypeId: "default-type-id",
    status: "active",
  });

  const cinemasMutation = useLTTMutation<PagedResultDto<CinemaOutputDto> | undefined, GetCinemaListInputDto>({
    mutationFn: (input) => cinemaService.getCinemaListAsync(input),
    onSuccess: (res) => {
      if (res && res.items) {
        setCinemas(res.items);
        if (res.items.length > 0) {
          setSelectedCinemaId(res.items[0].id);
        }
      }
    }
  });

  const listMutation = useLTTMutation<PagedResultDto<CinemaAmenityOutputDto> | undefined, { cinemaId: string; params: GetCinemaAmenityListInputDto }>({
    mutationFn: (input) => cinemaAmenityService.getCinemaAmenityListAsync(input.cinemaId, input.params),
    onSuccess: (res) => {
      if (res && res.items) {
        setItems(res.items);
      } else {
        setItems([]);
      }
    },
    onError: (err) => toast.error(err.message || "Lỗi tải tiện ích")
  });

  const createMutation = useLTTMutation<CinemaAmenityOutputDto | undefined, { cinemaId: string; body: CreateCinemaAmenityInputDto }>({
    mutationFn: (input) => cinemaAmenityService.createCinemaAmenityAsync(input.cinemaId, input.body),
    onSuccess: () => {
      toast.success("Thêm tiện ích thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const updateMutation = useLTTMutation<CinemaAmenityOutputDto | undefined, { cinemaId: string; id: string; body: UpdateCinemaAmenityInputDto }>({
    mutationFn: (input) => cinemaAmenityService.updateCinemaAmenityAsync(input.cinemaId, input.id, input.body),
    onSuccess: () => {
      toast.success("Cập nhật tiện ích thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const removeMutation = useLTTMutation<boolean, { cinemaId: string; id: string }>({
    mutationFn: async (input) => { await cinemaAmenityService.deleteCinemaAmenityAsync(input.cinemaId, input.id); return true; },
    onSuccess: () => {
      toast.success("Xóa tiện ích thành công");
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || removeMutation.isLoading || cinemasMutation.isLoading;

  useEffect(() => {
    cinemasMutation.mutation({ page: 1, fetch: 100 });
  }, []);

  const fetchData = (keyword?: string) => {
    if (!selectedCinemaId) return;
    const effectiveKeyword = keyword ?? debouncedSearch;
    listMutation.mutation({ cinemaId: selectedCinemaId, params: { page: 1, fetch: 100, keyword: effectiveKeyword } });
  };

  const debouncedSearch = useDebouncedListQuery(
    search,
    (keyword) => fetchData(keyword),
    [selectedCinemaId]
  );

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((c) => c.name.toLowerCase().includes(q));
  }, [items, search]);

  const allSel = filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const toggleAll = () =>
    allSel ? setSelected(new Set()) : setSelected(new Set(items.map((i) => i.id)));
  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const openCreate = () => {
    if (!selectedCinemaId) {
      toast.error("Vui lòng chọn rạp trước");
      return;
    }
    setEditing(null);
    setForm({
      name: "",
      description: "",
      amenityTypeId: "default-type-id",
      status: "active",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: CinemaAmenityOutputDto) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || "",
      amenityTypeId: item.amenityTypeId || "default-type-id",
      status: item.status || "active",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Tên tiện ích không được để trống");
      return;
    }

    if (editing) {
      updateMutation.mutation({ cinemaId: selectedCinemaId, id: editing.id, body: form });
    } else {
      createMutation.mutation({ cinemaId: selectedCinemaId, body: form });
    }
  };

  const bulkDelete = async () => {
    if (isBulkDeleting) {
      return;
    }

    if (!selectedCinemaId || selected.size === 0) {
      return;
    }

    const ids = Array.from(selected);
    setIsBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => cinemaAmenityService.deleteCinemaAmenityAsync(selectedCinemaId, id))
      );
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(`Xóa ${ids.length} tiện ích thành công`);
      } else {
        toast.error(`Xóa thành công ${ids.length - failed}/${ids.length} tiện ích`);
      }

      setSelected(new Set());
      setDeleteOpen(false);
      fetchData(debouncedSearch);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Cơ Sở Vật Chất / Tiện Ích Rạp</h1>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <LTTSelect value={selectedCinemaId} onValueChange={(v: any) => setSelectedCinemaId(v)}>
              <LTTSelectTrigger><LTTSelectValue placeholder="Chọn rạp" /></LTTSelectTrigger>
              <LTTSelectContent>
                {cinemas.map(c => (
                  <LTTSelectItem key={c.id} value={c.id}>{c.name}</LTTSelectItem>
                ))}
              </LTTSelectContent>
            </LTTSelect>
          </div>
          <LTTButton onClick={openCreate} className="gap-2" disabled={!selectedCinemaId}>
            <Plus className="h-4 w-4" /> Thêm tiện ích
          </LTTButton>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm kiếm tiện ích..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <LTTButton
          variant="outline"
          className="gap-2"
          onClick={() => fetchData(debouncedSearch)}
          loading={listMutation.isLoading}
          disabled={!selectedCinemaId}
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </LTTButton>
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
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSel} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Tên tiện ích</th>
              <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                  Đang tải dữ liệu tiện ích...
                </td>
              </tr>
            ) : !selectedCinemaId ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                  Vui lòng chọn rạp để xem tiện ích.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground-shadcn">
                  Không có dữ liệu tiện ích nào.
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
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn">{item.description}</td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={`font-medium ${statusColors[item.status || "active"] || statusColors.active}`}
                    >
                      {item.status === "active" ? "Hoạt động" : item.status === "maintenance" ? "Bảo trì" : "Không hoạt động"}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </LTTButton>
                      <LTTConfirmDialog
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa tiện ích này? Hành động này không thể hoàn tác."
                        confirmText="Xóa"
                        cancelText="Hủy"
                        onConfirm={async () => {
                          await removeMutation.mutation({ cinemaId: selectedCinemaId, id: item.id });
                          fetchData();
                        }}
                        loading={removeMutation.isLoading}
                        trigger={
                          <LTTButton
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </LTTButton>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>{editing ? "Chỉnh sửa tiện ích" : "Thêm tiện ích mới"}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <LTTLabel>Tên tiện ích *</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Trạng thái</LTTLabel>
              <LTTSelect value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <LTTSelectTrigger><LTTSelectValue /></LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="active">Hoạt động</LTTSelectItem>
                  <LTTSelectItem value="maintenance">Bảo trì</LTTSelectItem>
                  <LTTSelectItem value="inactive">Không hoạt động</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Mô tả</LTTLabel>
              <LTTInput
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>Hủy</LTTButton>
            <LTTButton onClick={save} loading={createMutation.isLoading || updateMutation.isLoading}>
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
              Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> tiện ích đã chọn? Hành động này không thể hoàn tác.
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete} loading={isBulkDeleting}>Xác nhận xóa</LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}
