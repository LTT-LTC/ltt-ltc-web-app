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

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-red-100 text-red-700 border-red-200",
};

export default function ScreensConfigPage() {
  const [items, setItems] = useState<ScreenOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ScreenOutputDto | null>(null);
  
  // TODO: Get actual cinemaId from manager context
  const cinemaId = "default-cinema-id";

  const [form, setForm] = useState({
    screenNumber: 1,
    screenType: "2D",
    seatCount: 100,
    seatLayout: "Standard",
    status: "active",
  });

  const listMutation = useLTTMutation<PagedResultDto<ScreenOutputDto> | undefined, { cinemaId: string; params: GetScreenListInputDto }>({
    mutationFn: (input) => screenService.getListAll(input.cinemaId, input.params),
    onSuccess: (res) => {
      if (res && res.items) setItems(res.items);
    },
    onError: (err) => toast.error(err.message || "Lỗi tải danh sách phòng chiếu")
  });

  const createMutation = useLTTMutation<ScreenOutputDto | undefined, { cinemaId: string; body: CreateScreenInputDto }>({
    mutationFn: (input) => screenService.create(input.cinemaId, input.body),
    onSuccess: () => {
      toast.success("Thêm phòng chiếu thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const updateMutation = useLTTMutation<ScreenOutputDto | undefined, { id: string; body: UpdateScreenInputDto }>({
    mutationFn: (input) => screenService.update(input.id, input.body),
    onSuccess: () => {
      toast.success("Cập nhật phòng chiếu thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const removeMutation = useLTTMutation<boolean, string>({
    mutationFn: async (id) => { await screenService.delete(id); return true; },
    onSuccess: () => {
      toast.success("Xóa phòng chiếu thành công");
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || removeMutation.isLoading;

  const fetchData = () => {
    listMutation.mutation({ cinemaId, params: { page: 1, fetch: 100, keyword: search } });
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (c) => c.screenNumber.toString().includes(q) || c.screenType?.toLowerCase().includes(q)
    );
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
    if (form.screenNumber <= 0) {
      toast.error("Số phòng chiếu không hợp lệ");
      return;
    }
    
    if (editing) {
      updateMutation.mutation({ id: editing.id, body: form });
    } else {
      createMutation.mutation({ cinemaId, body: form });
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
        <h1 className="font-heading text-2xl font-bold">Quản lý Phòng Chiếu</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm phòng chiếu
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm kiếm phòng chiếu..."
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
              <th className="px-4 py-3 text-left font-semibold">Phòng chiếu số</th>
              <th className="px-4 py-3 text-left font-semibold">Loại màn hình</th>
              <th className="px-4 py-3 text-left font-semibold">Số lượng ghế</th>
              <th className="px-4 py-3 text-left font-semibold">Bố trí ghế</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground-shadcn">
                  Không có dữ liệu phòng chiếu nào.
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
              <LTTSelect value={form.screenType} onValueChange={(v: any) => setForm({ ...form, screenType: v })}>
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
              <LTTLabel>Bố trí ghế (Tên sơ đồ)</LTTLabel>
              <LTTInput
                value={form.seatLayout}
                onChange={(e) => setForm({ ...form, seatLayout: e.target.value })}
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
              Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> phòng chiếu đã chọn? Hành động này không thể hoàn tác.
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
