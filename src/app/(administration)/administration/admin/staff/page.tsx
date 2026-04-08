"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Shield } from "lucide-react";
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
import {
  StaffMember,
  mockStaff,
  staffRoles,
  mockAdminCinemas,
} from "@/src/@core/const/mock/adminMockData";
import { cn } from "@/src/@core/utils/cn";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
  suspended: "bg-red-100 text-red-700 border-red-200",
};
const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Ngưng",
  suspended: "Tạm khóa",
};

export default function StaffPage() {
  const [items, setItems] = useState<StaffMember[]>(mockStaff);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    role: "Box Office",
    cinemaId: "all",
    status: "active" as StaffMember["status"],
  });

  const filtered = useMemo(() => {
    let list = items;
    if (roleFilter !== "all") list = list.filter((s) => s.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.fullname.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, search, roleFilter]);

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
      fullname: "",
      email: "",
      phone: "",
      role: "Box Office",
      cinemaId: "all",
      status: "active",
    });
    setDialogOpen(true);
  };
  const openEdit = (s: StaffMember) => {
    setEditing(s);
    setForm({
      fullname: s.fullname,
      email: s.email,
      phone: s.phone,
      role: s.role,
      cinemaId: s.cinemaId,
      status: s.status,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.fullname.trim()) {
      toast.error("Họ tên không được để trống");
      return;
    }
    const cinema =
      form.cinemaId === "all"
        ? { name: "Tất cả" }
        : mockAdminCinemas.find((c) => c.id === form.cinemaId);
    if (editing) {
      setItems((p) =>
        p.map((i) =>
          i.id === editing.id ? { ...i, ...form, cinemaName: cinema?.name || "" } : i
        )
      );
      toast.success("Cập nhật thành công");
    } else {
      setItems((p) => [
        ...p,
        {
          id: `s-${Date.now()}`,
          ...form,
          cinemaName: cinema?.name || "",
          joinedAt: new Date().toISOString().slice(0, 10),
          lastLogin: "",
        },
      ]);
      toast.success("Tạo mới thành công");
    }
    setDialogOpen(false);
  };

  const bulkDelete = () => {
    setItems((p) => p.filter((i) => !selected.has(i.id)));
    toast.success(`Đã xóa ${selected.size} nhân viên`);
    setSelected(new Set());
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Nhân viên & Phân quyền</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm nhân viên
        </LTTButton>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm nhân viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <LTTSelect value={roleFilter} onValueChange={setRoleFilter}>
          <LTTSelectTrigger className="w-48">
            <LTTSelectValue placeholder="Tất cả vai trò" />
          </LTTSelectTrigger>
          <LTTSelectContent>
            <LTTSelectItem value="all">Tất cả vai trò</LTTSelectItem>
            {staffRoles.map((r) => (
              <LTTSelectItem key={r} value={r}>
                {r}
              </LTTSelectItem>
            ))}
          </LTTSelectContent>
        </LTTSelect>
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
              <th className="px-4 py-3 text-left font-semibold">Họ tên</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">SĐT</th>
              <th className="px-4 py-3 text-left font-semibold">Vai trò</th>
              <th className="px-4 py-3 text-left font-semibold">Rạp</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-left font-semibold">Đăng nhập cuối</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Không tìm thấy nhân viên nào phù hợp.
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
                  <td className="px-4 py-3 font-medium">{item.fullname}</td>
                  <td className="px-4 py-3 text-xs">{item.email}</td>
                  <td className="px-4 py-3 text-xs">{item.phone}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-shadcn px-2.5 py-0.5 text-xs font-medium text-accent-shadcn-foreground border border-red-200">
                      <Shield className="h-3 w-3" />
                      {item.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{item.cinemaName}</td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={cn("font-medium", statusColor[item.status])}
                    >
                      {statusLabel[item.status]}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {item.lastLogin || "—"}
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
                          toast.success("Đã xóa nhân viên " + item.fullname);
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
              {editing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Họ tên *</LTTLabel>
              <LTTInput
                value={form.fullname}
                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Email</LTTLabel>
              <LTTInput
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>SĐT</LTTLabel>
              <LTTInput
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Vai trò</LTTLabel>
              <LTTSelect
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {staffRoles.map((r) => (
                    <LTTSelectItem key={r} value={r}>
                      {r}
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>Rạp</LTTLabel>
              <LTTSelect
                value={form.cinemaId}
                onValueChange={(v) => setForm({ ...form, cinemaId: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="all">Tất cả</LTTSelectItem>
                  {mockAdminCinemas.map((c) => (
                    <LTTSelectItem key={c.id} value={c.id}>
                      {c.name}
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
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
                  <LTTSelectItem value="inactive">Ngưng</LTTSelectItem>
                  <LTTSelectItem value="suspended">Tạm khóa</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
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
              Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> nhân viên
              đã chọn? Hành động này không thể hoàn tác.
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
