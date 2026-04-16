"use client";


import { useState, useMemo, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { seatTypeService } from "@/src/services/administration-service/seat-type/seat-type.service";
import { SeatTypeOutputDto } from "@/src/services/administration-service/seat-type/models/output.model";
import { GetSeatTypeListInputDto, CreateSeatTypeInputDto, UpdateSeatTypeInputDto } from "@/src/services/administration-service/seat-type/models/input.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

export default function SeatTypesManagerPage() {
  const [items, setItems] = useState<SeatTypeOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<SeatTypeOutputDto | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    numberOfSeat: 1,
    displayDirection: "HORIZONTAL",
    priceMultiplier: 1.0,
  });

  const listMutation = useLTTMutation<PagedResultDto<SeatTypeOutputDto> | undefined, GetSeatTypeListInputDto>({
    mutationFn: (input) => seatTypeService.getList(input),
    onSuccess: (res) => {
      if (res && res.items) setItems(res.items);
    },
    onError: (err) => toast.error(err.message || "Lỗi tải danh sách loại ghế")
  });

  const createMutation = useLTTMutation<SeatTypeOutputDto | undefined, CreateSeatTypeInputDto>({
    mutationFn: (input) => seatTypeService.create(input),
    onSuccess: () => {
      toast.success("Thêm loại ghế thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const updateMutation = useLTTMutation<SeatTypeOutputDto | undefined, { id: string; body: UpdateSeatTypeInputDto }>({
    mutationFn: (input) => seatTypeService.update(input.id, input.body),
    onSuccess: () => {
      toast.success("Cập nhật loại ghế thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const removeMutation = useLTTMutation<boolean, string>({
    mutationFn: async (id) => { await seatTypeService.delete(id); return true; },
    onSuccess: () => {
      toast.success("Xóa loại ghế thành công");
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || removeMutation.isLoading;

  const fetchData = () => {
    listMutation.mutation({ page: 1, fetch: 100, keyword: search });
  };

  useEffect(() => {
    fetchData();
  }, [search]);

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
    setEditing(null);
    setForm({
      name: "",
      description: "",
      numberOfSeat: 1,
      displayDirection: "HORIZONTAL",
      priceMultiplier: 1.0,
    });
    setDialogOpen(true);
  };

  const openEdit = (item: SeatTypeOutputDto) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || "",
      numberOfSeat: item.numberOfSeat,
      displayDirection: item.displayDirection || "HORIZONTAL",
      priceMultiplier: item.priceMultiplier,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Tên loại ghế không được để trống");
      return;
    }
    
    if (editing) {
      updateMutation.mutation({ id: editing.id, body: form });
    } else {
      createMutation.mutation(form);
    }
  };

  const bulkDelete = async () => {
    for (const id of Array.from(selected)) {
        await removeMutation.mutation(id);
    }
    setSelected(new Set());
    setDeleteOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Quản lý Cấu hình Loại Ghế</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm loại ghế
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm kiếm loại ghế..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSel} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Tên loại ghế</th>
              <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
              <th className="px-4 py-3 text-left font-semibold">Số chỗ ngồi</th>
              <th className="px-4 py-3 text-left font-semibold">Hệ số giá</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground-shadcn">
                  Không có dữ liệu loại ghế.
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
                  <td className="px-4 py-3">{item.numberOfSeat}</td>
                  <td className="px-4 py-3 font-semibold text-brand-600">x{item.priceMultiplier}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={async () => {
                          removeMutation.mutation(item.id);
                          setTimeout(() => fetchData(), 500);
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

      <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>{editing ? "Chỉnh sửa loại ghế" : "Thêm loại ghế mới"}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <LTTLabel>Tên loại ghế *</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Hệ số giá (VD: 1.5) *</LTTLabel>
              <LTTInput
                type="number"
                step="0.1"
                value={form.priceMultiplier}
                onChange={(e) => setForm({ ...form, priceMultiplier: parseFloat(e.target.value) || 1.0 })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Số chỗ ngồi *</LTTLabel>
              <LTTInput
                type="number"
                value={form.numberOfSeat}
                onChange={(e) => setForm({ ...form, numberOfSeat: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Hướng xếp ghế *</LTTLabel>
              <LTTInput
                value={form.displayDirection}
                onChange={(e) => setForm({ ...form, displayDirection: e.target.value })}
              />
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
            <LTTButton onClick={save}>{editing ? "Lưu" : "Tạo mới"}</LTTButton>
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
              Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> loại ghế đã chọn? Hành động này không thể hoàn tác.
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete}>Xác nhận xóa</LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}
