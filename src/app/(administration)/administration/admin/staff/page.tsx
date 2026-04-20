"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Shield, RefreshCw } from "lucide-react";
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
import { employeeService } from "@/src/services/administration-service/employee/employee.service";
import { EmployeeOutputDto, PagedResultEmployeeOutputDto } from "@/src/services/administration-service/employee/models/output.model";
import { GetListEmployeeInputDto, CreateEmployeeInputDto, UpdateEmployeeInputDto } from "@/src/services/administration-service/employee/models/input.model";
import { cinemaService } from "@/src/services/administration-service/cinema/cinema.service";
import { cn } from "@/src/@core/utils/cn";
import { useSearchParams } from "next/navigation";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
};

const statusLabel: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Ngưng",
};

const EMPLOYEE_ROLES = ["Admin", "Manager", "Staff"] as const;
type EmployeeRole = typeof EMPLOYEE_ROLES[number];

type EmployeeFormState = {
  name: string;
  email: string;
  phoneNumber: string;
  code: string;
  joinedDate: string;
  dateOfBirth: string;
  organizationUnitId: string;
  positionId: string;
  role: EmployeeRole;
  isActive: boolean;
};

const normalizeRole = (item: EmployeeOutputDto): EmployeeRole => {
  const roleName = (item.positionName || "").trim().toLowerCase();
  if (roleName === "admin") return "Admin";
  if (roleName === "manager") return "Manager";
  return "Staff";
};

const emptyForm = (): EmployeeFormState => ({
  name: "",
  email: "",
  phoneNumber: "",
  code: `EMP-${Date.now()}`,
  joinedDate: new Date().toISOString().split("T")[0],
  dateOfBirth: "",
  organizationUnitId: "",
  positionId: "",
  role: "Staff",
  isActive: true,
});

export default function StaffPage() {
  const searchParams = useSearchParams();
  const cinemaId = searchParams.get("cinemaId") || undefined;
  const [items, setItems] = useState<EmployeeOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeOutputDto | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);
  const listMutation = useLTTMutation<PagedResultEmployeeOutputDto | undefined, GetListEmployeeInputDto>({
    mutationFn: (params) => employeeService.getEmployeeListAsync(params),
    onSuccess: (res) => { if (res && res.items) setItems(res.items); },
    onError: (err) => toast.error(err.message || "Lỗi tải danh sách nhân viên")
  });

  const [cinemas, setCinemas] = useState<any[]>([]);
  const cinemasMutation = useLTTMutation<any | undefined, any>({
    mutationFn: (params) => cinemaService.getCinemaListAsync(params),
    onSuccess: (res) => { if (res && res.items) setCinemas(res.items); }
  });

  const createMutation = useLTTMutation<string | undefined, CreateEmployeeInputDto>({
    mutationFn: (input) => employeeService.createEmployeeAsync(input),
    onSuccess: () => {
      toast.success("Thêm nhân viên thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const updateMutation = useLTTMutation<boolean | undefined, { id: string; body: UpdateEmployeeInputDto }>({
    mutationFn: (input) => employeeService.updateEmployeeAsync(input.id, input.body),
    onSuccess: () => {
      toast.success("Cập nhật thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const deleteMutation = useLTTMutation<void, string>({
    mutationFn: (id) => employeeService.deleteEmployeeAsync(id),
    onError: (err) => toast.error(err.message || "Không thể xóa nhân viên")
  });

  const fetchData = () => {
    listMutation.mutation({ page: 1, fetch: 100, keyword: debouncedSearch, cinemaId });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, cinemaId]);

  useEffect(() => {
    cinemasMutation.mutation({ page: 1, fetch: 100 });
  }, []);

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading;

  const rolePositionIdMap = useMemo(() => {
    const map = new Map<EmployeeRole, string>();
    for (const item of items) {
      if (item.positionId) {
        map.set(normalizeRole(item), item.positionId);
      }
    }
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (roleFilter !== "all") {
      list = list.filter((s) => normalizeRole(s) === roleFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q)
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
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (s: EmployeeOutputDto) => {
    setEditing(s);
    setForm({
      name: s.name,
      email: s.email,
      phoneNumber: s.phoneNumber || "",
      code: s.code,
      joinedDate: s.joinedDate ? s.joinedDate.split("T")[0] : "",
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split("T")[0] : "",
      organizationUnitId: s.organizationUnitId || "",
      positionId: s.positionId || "",
      role: normalizeRole(s),
      isActive: s.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phoneNumber.trim() || !form.code.trim()) {
      toast.error("Vui lòng điền đầy đủ họ tên, email, số điện thoại và mã nhân viên");
      return;
    }

    const resolvedPositionId =
      rolePositionIdMap.get(form.role) ||
      form.positionId ||
      editing?.positionId ||
      null;

    const payload = {
      ...form,
      positionId: resolvedPositionId,
    };

    if (editing) {
      updateMutation.mutation({ id: editing.id, body: payload as UpdateEmployeeInputDto });
    } else {
      createMutation.mutation(payload as CreateEmployeeInputDto);
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    const results = await Promise.allSettled(ids.map((id) => employeeService.deleteEmployeeAsync(id)));
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed === 0) {
      toast.success(`Đã xóa ${ids.length} nhân viên`);
    } else {
      toast.error(`Xóa thành công ${ids.length - failed}/${ids.length} nhân viên`);
    }

    fetchData();
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
            {EMPLOYEE_ROLES.map((r) => (
              <LTTSelectItem key={r} value={r}>
                {r}
              </LTTSelectItem>
            ))}
          </LTTSelectContent>
        </LTTSelect>
        <LTTButton
          variant="outline"
          className="gap-2"
          onClick={fetchData}
          loading={listMutation.isLoading}
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
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Đang tải dữ liệu nhân viên...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
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
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-xs">{item.email}</td>
                  <td className="px-4 py-3 text-xs">{item.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-shadcn px-2.5 py-0.5 text-xs font-medium text-accent-shadcn-foreground border border-red-200">
                      <Shield className="h-3 w-3" />
                      {normalizeRole(item)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{item.organizationUnitName || "—"}</td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={cn("font-medium", item.isActive ? statusColor.active : statusColor.inactive)}
                    >
                      {item.isActive ? statusLabel.active : statusLabel.inactive}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    —
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
                        onClick={async () => {
                          try {
                            await employeeService.deleteEmployeeAsync(item.id);
                            toast.success("Đã xóa nhân viên " + item.name);
                            fetchData();
                          } catch (error: any) {
                            toast.error(error?.message || "Không thể xóa nhân viên");
                          }
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Email *</LTTLabel>
              <LTTInput
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>SĐT *</LTTLabel>
              <LTTInput
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Mã nhân viên</LTTLabel>
              <LTTInput
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Vai trò *</LTTLabel>
              <LTTSelect
                value={form.role}
                onValueChange={(v: EmployeeRole) => setForm({ ...form, role: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder="Chọn vai trò" />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {EMPLOYEE_ROLES.map((role) => (
                    <LTTSelectItem key={role} value={role}>{role}</LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>Rạp (Phòng ban)</LTTLabel>
              <LTTSelect
                value={form.organizationUnitId}
                onValueChange={(v) => setForm({ ...form, organizationUnitId: v })}
              >
                <LTTSelectTrigger>
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
            </div>
            <div className="space-y-2">
              <LTTLabel>Ngày gia nhập</LTTLabel>
              <LTTInput
                type="date"
                value={form.joinedDate}
                onChange={(e) => setForm({ ...form, joinedDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Ngày sinh</LTTLabel>
              <LTTInput
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Trạng thái</LTTLabel>
              <LTTSelect
                value={form.isActive ? "active" : "inactive"}
                onValueChange={(v: any) => setForm({ ...form, isActive: v === "active" })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="active">Hoạt động</LTTSelectItem>
                  <LTTSelectItem value="inactive">Tạm ngưng</LTTSelectItem>
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
