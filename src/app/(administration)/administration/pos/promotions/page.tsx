"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Copy, Ticket } from "lucide-react";
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
import { LTTProgress } from "@/src/@core/component/LTTShadcnUI/LTTProgress";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { toast } from "sonner";
import { Promotion, mockPromotions } from "@/src/@core/const/mock/adminMockData";
import { cn } from "@/src/@core/utils/cn";

const typeLabel: Record<string, string> = {
  percentage: "Giảm %",
  fixed: "Giảm cố định",
  buy_x_get_y: "Mua X tặng Y",
  gift_card: "Gift Card",
};
const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  expired: "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
  draft: "bg-blue-100 text-blue-700 border-blue-200",
};
const statusLabel: Record<string, string> = {
  active: "Đang chạy",
  expired: "Hết hạn",
  draft: "Bản nháp",
};

export default function PromotionsPage() {
  const [items, setItems] = useState<Promotion[]>(mockPromotions);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "percentage" as Promotion["type"],
    value: "10",
    minOrderValue: "0",
    maxDiscount: "50000",
    usageLimit: "100",
    startDate: "",
    endDate: "",
    applicableTo: "Tất cả",
    status: "draft" as Promotion["status"],
  });

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
    );
  }, [items, search]);

  const allSel =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const toggleAll = () =>
    allSel
      ? setSelected(new Set())
      : setSelected(new Set(filtered.map((i) => i.id)));
  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      code: "",
      type: "percentage",
      value: "10",
      minOrderValue: "0",
      maxDiscount: "50000",
      usageLimit: "100",
      startDate: "",
      endDate: "",
      applicableTo: "Tất cả",
      status: "draft",
    });
    setDialogOpen(true);
  };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      name: p.name,
      code: p.code,
      type: p.type,
      value: String(p.value),
      minOrderValue: String(p.minOrderValue),
      maxDiscount: String(p.maxDiscount),
      usageLimit: String(p.usageLimit),
      startDate: p.startDate,
      endDate: p.endDate,
      applicableTo: p.applicableTo,
      status: p.status,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Tên và mã khuyến mãi không được để trống");
      return;
    }
    if (editing) {
      setItems((p) =>
        p.map((i) =>
          i.id === editing.id
            ? {
                ...i,
                ...form,
                value: parseFloat(form.value),
                minOrderValue: parseInt(form.minOrderValue),
                maxDiscount: parseInt(form.maxDiscount),
                usageLimit: parseInt(form.usageLimit),
              }
            : i
        )
      );
      toast.success("Cập nhật thành công");
    } else {
      setItems((p) => [
        ...p,
        {
          id: `p-${Date.now()}`,
          ...form,
          value: parseFloat(form.value),
          minOrderValue: parseInt(form.minOrderValue),
          maxDiscount: parseInt(form.maxDiscount),
          usageLimit: parseInt(form.usageLimit),
          usedCount: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ]);
      toast.success("Tạo mới thành công");
    }
    setDialogOpen(false);
  };

  const bulkDelete = () => {
    setItems((p) => p.filter((i) => !selected.has(i.id)));
    toast.success(`Đã xóa ${selected.size} khuyến mãi`);
    setSelected(new Set());
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Khuyến mãi & Gift Cards</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm khuyến mãi
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm theo tên hoặc mã..."
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
              <th className="px-4 py-3 text-left font-semibold">Khuyến mãi</th>
              <th className="px-4 py-3 text-left font-semibold">Mã code</th>
              <th className="px-4 py-3 text-left font-semibold">Loại hình</th>
              <th className="px-4 py-3 text-left font-semibold">Giá trị</th>
              <th className="px-4 py-3 text-left font-semibold w-40">Sử dụng</th>
              <th className="px-4 py-3 text-left font-semibold">Thời hạn</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Không tìm thấy chương trình khuyến mãi nào.
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      <Ticket className="h-4 w-4 text-primary-shadcn opacity-50" />
                      {item.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="inline-flex items-center gap-2 rounded border border-border-shadcn bg-muted-shadcn/50 px-2.5 py-1 font-mono text-xs font-bold hover:bg-muted-shadcn transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(item.code);
                        toast.success("Đã sao chép mã " + item.code);
                      }}
                    >
                      {item.code} <Copy className="h-3 w-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs">{typeLabel[item.type]}</td>
                  <td className="px-4 py-3 font-semibold text-primary-shadcn">
                    {item.type === "percentage"
                      ? `${item.value}%`
                      : item.type === "fixed" || item.type === "gift_card"
                      ? `${item.value.toLocaleString()}đ`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground-shadcn">
                        <span>Lượt dùng</span>
                        <span>
                          {item.usedCount}/{item.usageLimit}
                        </span>
                      </div>
                      <LTTProgress
                        value={(item.usedCount / item.usageLimit) * 100}
                        className="h-1.5"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground-shadcn">
                    {item.startDate} <span className="mx-1">→</span> {item.endDate}
                  </td>
                  <td className="px-4 py-3">
                    <LTTBadge className={cn("font-medium", statusColor[item.status])}>
                      {statusLabel[item.status]}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
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
                        onClick={() => {
                          setItems((p) => p.filter((i) => i.id !== item.id));
                          toast.success("Đã xóa chương trình");
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
        <LTTDialogContent className="sm:max-w-xl">
          <LTTDialogHeader>
            <LTTDialogTitle>
              {editing ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Tên chương trình *</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Mã code (ID) *</LTTLabel>
              <LTTInput
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Loại hình</LTTLabel>
              <LTTSelect
                value={form.type}
                onValueChange={(v: any) => setForm({ ...form, type: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {Object.entries(typeLabel).map(([k, v]) => (
                    <LTTSelectItem key={k} value={k}>
                      {v}
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>Giá trị giảm (số)</LTTLabel>
              <LTTInput
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Giới hạn lượt dùng</LTTLabel>
              <LTTInput
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Ngày bắt đầu</LTTLabel>
              <LTTInput
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Ngày kết thúc</LTTLabel>
              <LTTInput
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Áp dụng cho đối tượng</LTTLabel>
              <LTTInput
                value={form.applicableTo}
                onChange={(e) =>
                  setForm({ ...form, applicableTo: e.target.value })
                }
              />
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
                  <LTTSelectItem value="draft">Bản nháp</LTTSelectItem>
                  <LTTSelectItem value="active">Đang áp dụng</LTTSelectItem>
                  <LTTSelectItem value="expired">Đã hết hạn</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </LTTButton>
            <LTTButton onClick={save}>
              {editing ? "Lưu thay đổi" : "Kích hoạt khuyến mãi"}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa chương trình</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> khuyến mãi
              đã chọn? Các mã code này sẽ không còn hiệu lực.
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>
              Hủy
            </LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete}>
              Xác nhận xóa
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}
