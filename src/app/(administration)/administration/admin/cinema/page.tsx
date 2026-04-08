"use client";

import { useState, useMemo } from "react";
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
import { AdminCinema, mockAdminCinemas } from "@/src/@core/const/mock/adminMockData";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  closed: "bg-red-100 text-red-700 border-red-200",
};

export default function CinemaConfigPage() {
  const [items, setItems] = useState<AdminCinema[]>(mockAdminCinemas);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCinema | null>(null);
  const [form, setForm] = useState({
    name: "",
    province: "",
    address: "",
    phone: "",
    email: "",
    status: "active" as AdminCinema["status"],
  });

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
    );
  }, [items, search]);

  const allSel = filtered.length > 0 && filtered.every((i) => selected.has(i.id));
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
      province: "",
      address: "",
      phone: "",
      email: "",
      status: "active",
    });
    setDialogOpen(true);
  };
  const openEdit = (item: AdminCinema) => {
    setEditing(item);
    setForm({
      name: item.name,
      province: item.province,
      address: item.address,
      phone: item.phone,
      email: item.email,
      status: item.status,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Tên rạp không được để trống");
      return;
    }
    const now = new Date()
      .toLocaleString("sv-SE")
      .slice(0, 16)
      .replace("T", " ");
    if (editing) {
      setItems((p) =>
        p.map((i) =>
          i.id === editing.id ? { ...i, ...form, updatedAt: now } : i
        )
      );
      toast.success("Cập nhật thành công");
    } else {
      setItems((p) => [
        ...p,
        {
          id: `c-${Date.now()}`,
          tenantId: "tenant-001",
          screenCount: 0,
          createdAt: now,
          updatedAt: now,
          ...form,
        },
      ]);
      toast.success("Tạo mới thành công");
    }
    setDialogOpen(false);
  };

  const bulkDelete = () => {
    setItems((p) => p.filter((i) => !selected.has(i.id)));
    toast.success(`Đã xóa ${selected.size} rạp`);
    setSelected(new Set());
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Cấu hình rạp chiếu</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm rạp
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm kiếm rạp..."
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
              <th className="px-4 py-3 text-left font-semibold">STT</th>
              <th className="px-4 py-3 text-left font-semibold">Tên rạp</th>
              <th className="px-4 py-3 text-left font-semibold">Tỉnh/TP</th>
              <th className="px-4 py-3 text-left font-semibold">Địa chỉ</th>
              <th className="px-4 py-3 text-left font-semibold">Phòng chiếu</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Không có dữ liệu rạp chiếu nào phù hợp.
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
                      onCheckedChange={() => toggle(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.province}</td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn max-w-xs truncate">
                    {item.address}
                  </td>
                  <td className="px-4 py-3">{item.screenCount}</td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={`font-medium ${statusColors[item.status]}`}
                    >
                      {item.status === "active"
                        ? "Hoạt động"
                        : item.status === "maintenance"
                        ? "Bảo trì"
                        : "Đóng cửa"}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {item.updatedAt}
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
                          toast.success("Đã xóa rạp " + item.name);
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
            <LTTDialogTitle>
              {editing ? "Chỉnh sửa rạp" : "Thêm rạp mới"}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Tên rạp *</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Tỉnh/Thành phố</LTTLabel>
              <LTTInput
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
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
                  <LTTSelectItem value="active">Hoạt động</LTTSelectItem>
                  <LTTSelectItem value="maintenance">Bảo trì</LTTSelectItem>
                  <LTTSelectItem value="closed">Đóng cửa</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Địa chỉ</LTTLabel>
              <LTTInput
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Điện thoại</LTTLabel>
              <LTTInput
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Email</LTTLabel>
              <LTTInput
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </LTTButton>
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
              Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> rạp đã
              chọn? Hành động này không thể hoàn tác.
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
