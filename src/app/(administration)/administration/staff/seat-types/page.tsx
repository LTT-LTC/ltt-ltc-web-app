"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

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
import { LTTTextarea } from "@/src/@core/component/LTTShadcnUI/LTTTextarea";
import {
  LTTSelect,
  LTTSelectContent,
  LTTSelectItem,
  LTTSelectTrigger,
  LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";

import {
  SeatType,
  mockSeatTypes,
} from "@/src/@core/const/mock/adminMockData";

const SEAT_TYPES_STORAGE_KEY = "ltt_admin_mock_seat_types";

function orientationLabel(o: SeatType["orientation"]) {
  if (o === "horizontal") return "Ngang";
  if (o === "vertical") return "Dọc";
  return "Vuông";
}

type SeatOrientation = SeatType["orientation"];

export default function SeatTypesPage() {
  const [seatTypes, setSeatTypes] = useState<SeatType[]>(mockSeatTypes);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeatType | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    priceMultiplier: "1.0",
    seatOccupied: "1",
    orientation: "square" as SeatOrientation,
  });

  const filtered = useMemo(() => {
    if (!searchQuery) return seatTypes;
    const q = searchQuery.toLowerCase();
    return seatTypes.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [seatTypes, searchQuery]);

  // Persist seat type CRUD to localStorage so the seat-map wizard can use it.
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(SEAT_TYPES_STORAGE_KEY);
      if (raw) setSeatTypes(JSON.parse(raw) as SeatType[]);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(SEAT_TYPES_STORAGE_KEY, JSON.stringify(seatTypes));
    } catch {}
  }, [seatTypes]);

  const allSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  };

  const toggleOne = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      name: "",
      description: "",
      priceMultiplier: "1.0",
      seatOccupied: "1",
      orientation: "square",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: SeatType) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      priceMultiplier: String(item.priceMultiplier),
      seatOccupied: String(item.seatOccupied),
      orientation: item.orientation,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Tên loại ghế không được để trống");
      return;
    }

    const now = new Date()
      .toLocaleString("sv-SE")
      .slice(0, 16)
      .replace("T", " ");

    const priceMultiplier = parseFloat(form.priceMultiplier) || 1;
    const seatOccupied = parseInt(form.seatOccupied) || 1;
    const orientation = form.orientation;

    if (editingItem) {
      setSeatTypes((prev) =>
        prev.map((s) =>
          s.id === editingItem.id
            ? {
                ...s,
                name: form.name,
                description: form.description,
                priceMultiplier,
                seatOccupied,
                orientation,
                updatedAt: now,
              }
            : s
        )
      );
      toast.success("Cập nhật thành công");
    } else {
      const newId = Math.max(...seatTypes.map((s) => s.id), 0) + 1;
      setSeatTypes((prev) => [
        ...prev,
        {
          id: newId,
          name: form.name,
          description: form.description,
          priceMultiplier,
          seatOccupied,
          orientation,
          createdAt: now,
          updatedAt: now,
        },
      ]);
      toast.success("Tạo mới thành công");
    }

    setDialogOpen(false);
  };

  const handleDeleteSelected = () => {
    setSeatTypes((prev) => prev.filter((s) => !selected.has(s.id)));
    setSelected(new Set());
    setDeleteDialogOpen(false);
    toast.success(`Đã xóa ${selected.size} loại ghế`);
  };

  const handleDeleteOne = (id: number) => {
    setSeatTypes((prev) => prev.filter((s) => s.id !== id));
    selected.delete(id);
    setSelected(new Set(selected));
    toast.success("Đã xóa loại ghế");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Quản lý loại ghế</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm loại ghế
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm kiếm loại ghế..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">STT</th>
              <th className="px-4 py-3 text-left font-semibold">Tên</th>
              <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
              <th className="px-4 py-3 text-left font-semibold">Hệ số giá</th>
              <th className="px-4 py-3 text-left font-semibold">
                Số ô chiếm
              </th>
              <th className="px-4 py-3 text-left font-semibold">Hướng</th>
              <th className="px-4 py-3 text-left font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
              <th className="px-4 py-3 text-right font-semibold">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-muted-foreground-shadcn">
                  Không có dữ liệu
                </td>
              </tr>
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
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn max-w-xs truncate">
                    {item.description}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-accent-shadcn px-2.5 py-0.5 text-xs font-medium text-accent-shadcn-foreground border border-red-200">
                      x{item.priceMultiplier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-accent-shadcn px-2.5 py-0.5 text-xs font-medium text-accent-shadcn-foreground border border-red-200">
                      {item.seatOccupied} ô
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{orientationLabel(item.orientation)}</td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {item.createdAt}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {item.updatedAt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
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

      <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LTTDialogContent className="sm:max-w-md">
          <LTTDialogHeader>
            <LTTDialogTitle>
              {editingItem ? "Chỉnh sửa loại ghế" : "Thêm loại ghế mới"}
            </LTTDialogTitle>
          </LTTDialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <LTTLabel>Tên loại ghế *</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: VIP, Standard..."
              />
            </div>

            <div className="space-y-2">
              <LTTLabel>Mô tả</LTTLabel>
              <LTTTextarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả ngắn về loại ghế..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <LTTLabel>Hệ số giá</LTTLabel>
                <LTTInput
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.priceMultiplier}
                  onChange={(e) => setForm({ ...form, priceMultiplier: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <LTTLabel>Số ô chiếm</LTTLabel>
                <LTTInput
                  type="number"
                  min="1"
                  max="4"
                  value={form.seatOccupied}
                  onChange={(e) => setForm({ ...form, seatOccupied: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <LTTLabel>Hướng hiển thị</LTTLabel>
              <LTTSelect
                value={form.orientation}
                onValueChange={(v) => setForm({ ...form, orientation: v as SeatOrientation })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="square">Vuông (1x1)</LTTSelectItem>
                  <LTTSelectItem value="horizontal">Ngang (chiếm theo hàng)</LTTSelectItem>
                  <LTTSelectItem value="vertical">Dọc (chiếm theo cột)</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
              <p className="text-[11px] text-muted-foreground-shadcn">
                {form.orientation === "square"
                  ? "Ghế vuông chiếm 1 ô duy nhất"
                  : form.orientation === "horizontal"
                  ? `Ghế sẽ chiếm ${form.seatOccupied} ô liên tiếp theo chiều ngang`
                  : `Ghế sẽ chiếm ${form.seatOccupied} ô liên tiếp theo chiều dọc`}
              </p>
            </div>
          </div>

          <LTTDialogFooter>
            <LTTButton
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Hủy
            </LTTButton>
            <LTTButton onClick={handleSave}>
              {editingItem ? "Lưu" : "Tạo mới"}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa</LTTDialogTitle>
          </LTTDialogHeader>
          <p className="text-sm text-muted-foreground-shadcn">
            Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> loại ghế đã chọn? Hành động này không thể hoàn tác.
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
    </div>
  );
}

