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
import LTTUnsavedChangesDialog from "@/src/@core/component/LTTUnsavedChangesDialog";
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
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
import AdminTablePagination from "../_components/AdminTablePagination";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
};

const EMPLOYEE_ROLES = ["Admin", "Manager", "Staff"] as const;
type EmployeeRole = typeof EMPLOYEE_ROLES[number];

type EmployeeFormState = {
  name: string;
  email: string;
  phoneNumber: string;
  code: string;
  hireDate: string;
  cinemaId: string;
  role: EmployeeRole;
  isActive: boolean;
};

const normalizeRole = (item: EmployeeOutputDto): EmployeeRole => {
  const roleName = (item.role || item.positionName || "").trim().toLowerCase();
  if (roleName === "admin") return "Admin";
  if (roleName === "manager") return "Manager";
  if (roleName === "pos") return "Staff";
  return "Staff";
};

const emptyForm = (): EmployeeFormState => ({
  name: "",
  email: "",
  phoneNumber: "",
  code: `EMP-${Date.now()}`,
  hireDate: new Date().toISOString().split("T")[0],
  cinemaId: "",
  role: "Staff",
  isActive: true,
});

export default function StaffPage() {
  const { t } = useLocalization();
  const searchParams = useSearchParams();
  const cinemaId = searchParams.get("cinemaId") || undefined;
  const [items, setItems] = useState<EmployeeOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [editing, setEditing] = useState<EmployeeOutputDto | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);
  const listMutation = useLTTMutation<PagedResultEmployeeOutputDto | undefined, GetListEmployeeInputDto>({
    mutationFn: (params) => employeeService.getEmployeeListAsync(params),
    onSuccess: (res) => {
      if (res && res.items) {
        setItems(res.items);
        setTotalCount(res.totalCount || res.items.length);
      }
    },
    onError: (err) => toast.error(err.message || t("admin.staff.fetch_error"))
  });

  const [cinemas, setCinemas] = useState<any[]>([]);
  const cinemasMutation = useLTTMutation<any | undefined, any>({
    mutationFn: (params) => cinemaService.getCinemaListAsync(params),
    onSuccess: (res) => { if (res && res.items) setCinemas(res.items); }
  });

  const createMutation = useLTTMutation<EmployeeOutputDto | undefined, CreateEmployeeInputDto>({
    mutationFn: (input) => employeeService.createEmployeeAsync(input),
    onSuccess: () => {
      toast.success(t("admin.staff.toast.create_success"));
      fetchData();
      setDialogOpen(false);
      setExitConfirmOpen(false);
      setIsDirty(false);
    },
    onError: (err) => toast.error(err.message || t("admin.staff.toast.generic_error"))
  });

  const updateMutation = useLTTMutation<EmployeeOutputDto | undefined, { id: string; body: UpdateEmployeeInputDto }>({
    mutationFn: (input) => employeeService.updateEmployeeAsync(input.id, input.body),
    onSuccess: () => {
      toast.success(t("admin.staff.toast.update_success"));
      fetchData();
      setDialogOpen(false);
      setExitConfirmOpen(false);
      setIsDirty(false);
    },
    onError: (err) => toast.error(err.message || t("admin.staff.toast.generic_error"))
  });

  const deleteMutation = useLTTMutation<void, string>({
    mutationFn: (id) => employeeService.deleteEmployeeAsync(id),
    onSuccess: () => {
      toast.success(t("admin.staff.toast.delete_success"));
      fetchData();
    },
    onError: (err) => toast.error(err.message || t("admin.staff.toast.delete_error"))
  });

  const fetchData = () => {
    listMutation.mutation({ page, fetch: pageSize, keyword: debouncedSearch, cinemaId });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, cinemaId, page, pageSize]);

  useEffect(() => {
    cinemasMutation.mutation({ page: 1, fetch: 100 });
  }, []);

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading;

  const filtered = useMemo(() => {
    let list = items;
    if (roleFilter !== "all") {
      list = list.filter((s) => normalizeRole(s) === roleFilter);
    }
    return list;
  }, [items, roleFilter]);

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
    setIsDirty(false);
    setExitConfirmOpen(false);
    setDialogOpen(true);
  };

  const openEdit = (s: EmployeeOutputDto) => {
    setEditing(s);
    setForm({
      name: s.name,
      email: s.email,
      phoneNumber: s.phoneNumber || "",
      code: s.code,
      hireDate: s.hireDate ? s.hireDate.split("T")[0] : "",
      cinemaId: s.cinemaId || s.organizationUnitId || "",
      role: normalizeRole(s),
      isActive: s.isActive ?? true,
    });
    setIsDirty(false);
    setExitConfirmOpen(false);
    setDialogOpen(true);
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setExitConfirmOpen(false);
    setIsDirty(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDialogOpen(true);
      return;
    }

    if (isDirty) {
      setExitConfirmOpen(true);
      return;
    }

    resetDialog();
  };

  const save = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phoneNumber.trim() || !form.code.trim()) {
      toast.error(t("admin.staff.toast.validation_required"));
      return;
    }

    if ((form.role === "Manager" || form.role === "Staff") && !form.cinemaId) {
      toast.error(t("admin.staff.toast.validation_required"));
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      phoneNumber: form.phoneNumber,
      code: form.code,
      hireDate: form.hireDate || undefined,
      cinemaId: form.role === "Admin" ? null : (form.cinemaId || null),
      isActive: form.isActive,
      role: form.role,
    };

    if (editing) {
      updateMutation.mutation({ id: editing.id, body: payload as UpdateEmployeeInputDto });
    } else {
      createMutation.mutation(payload as CreateEmployeeInputDto);
    }
  };

  const bulkDelete = async () => {
    if (isBulkDeleting) return;

    const ids = Array.from(selected);
    if (ids.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => employeeService.deleteEmployeeAsync(id)));
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(t("admin.staff.toast.bulk_delete_success", { count: ids.length }));
      } else {
        toast.error(
          t("admin.staff.toast.bulk_delete_partial", {
            success: ids.length - failed,
            total: ids.length,
          }),
        );
      }

      fetchData();
      setSelected(new Set());
      setDeleteOpen(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.staff.title")}</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> {t("admin.staff.add_employee")}
        </LTTButton>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.staff.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <LTTSelect value={roleFilter} onValueChange={setRoleFilter}>
          <LTTSelectTrigger className="w-48">
            <LTTSelectValue placeholder={t("admin.staff.filters.role_placeholder")} />
          </LTTSelectTrigger>
          <LTTSelectContent>
            <LTTSelectItem value="all">{t("admin.staff.filters.all_roles")}</LTTSelectItem>
            {EMPLOYEE_ROLES.map((r) => (
              <LTTSelectItem key={r} value={r}>
                {t(`admin.staff.roles.${r}`)}
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
          <RefreshCw className="h-4 w-4" /> {t("admin.staff.refresh")}
        </LTTButton>
        {selected.size > 0 && (
          <LTTButton
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> {t("admin.staff.delete_selected", { count: selected.size })}
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
              <th className="px-4 py-3 text-left font-semibold">{t("admin.staff.table.full_name")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.staff.table.email")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.staff.table.phone")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.staff.table.role")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.staff.table.cinema")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.staff.table.status")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("admin.staff.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <DomainTableStateRow colSpan={8} state="loading" loadingText={t("admin.staff.loading")} />
            ) : filtered.length === 0 ? (
              <DomainTableStateRow colSpan={8} state="empty" emptyText={t("admin.staff.empty")} />
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
                      {t(`admin.staff.roles.${normalizeRole(item)}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{item.cinemaName || item.organizationUnitName || t("admin.staff.table.dash")}</td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={cn("font-medium", item.isActive ? statusColor.active : statusColor.inactive)}
                    >
                      {item.isActive ? t("admin.staff.status.active") : t("admin.staff.status.inactive")}
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
                      <LTTConfirmDialog
                        title={t("admin.staff.confirm_delete.title")}
                        description={t("admin.staff.confirm_delete.description")}
                        confirmText={t("admin.common.delete_confirm.ok")}
                        cancelText={t("admin.common.delete_confirm.cancel")}
                        onConfirm={() => deleteMutation.mutation(item.id)}
                        loading={deleteMutation.isLoading}
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

      <AdminTablePagination
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        loading={listMutation.isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPage(1);
          setPageSize(size);
        }}
      />

      <LTTDialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>
              {editing ? t("admin.staff.form.edit_title") : t("admin.staff.form.create_title")}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>{t("admin.staff.form.full_name")}</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => { setIsDirty(true); setForm({ ...form, name: e.target.value }); }}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.staff.form.email")}</LTTLabel>
              <LTTInput
                type="email"
                value={form.email}
                onChange={(e) => { setIsDirty(true); setForm({ ...form, email: e.target.value }); }}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>SĐT *</LTTLabel>
              <LTTInput
                value={form.phoneNumber}
                onChange={(e) => { setIsDirty(true); setForm({ ...form, phoneNumber: e.target.value }); }}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.staff.form.code")}</LTTLabel>
              <LTTInput
                value={form.code}
                onChange={(e) => { setIsDirty(true); setForm({ ...form, code: e.target.value }); }}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.staff.form.role")}</LTTLabel>
              <LTTSelect
                value={form.role}
                onValueChange={(v: EmployeeRole) => { setIsDirty(true); setForm({ ...form, role: v }); }}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder={t("admin.staff.form.role_placeholder")} />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {EMPLOYEE_ROLES.map((role) => (
                    <LTTSelectItem key={role} value={role}>{t(`admin.staff.roles.${role}`)}</LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.staff.form.cinema")}</LTTLabel>
              <LTTSelect
                value={form.cinemaId}
                onValueChange={(v) => { setIsDirty(true); setForm({ ...form, cinemaId: v }); }}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder={t("admin.staff.form.cinema_placeholder")} />
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
                value={form.hireDate}
                onChange={(e) => { setIsDirty(true); setForm({ ...form, hireDate: e.target.value }); }}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.staff.form.account_status")}</LTTLabel>
              <LTTSelect
                value={form.isActive ? "active" : "inactive"}
                onValueChange={(v: any) => { setIsDirty(true); setForm({ ...form, isActive: v === "active" }); }}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="active">{t("admin.staff.status.active")}</LTTSelectItem>
                  <LTTSelectItem value="inactive">{t("admin.common.inactive")}</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => handleDialogOpenChange(false)}>
              {t("admin.staff.form.cancel")}
            </LTTButton>
            <LTTButton onClick={save} loading={createMutation.isLoading || updateMutation.isLoading}>
              {editing ? t("admin.staff.form.save") : t("admin.staff.form.create")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTUnsavedChangesDialog
        open={exitConfirmOpen}
        onOpenChange={setExitConfirmOpen}
        title={t("admin.common.unsaved_changes_dialog.title")}
        messageBefore={t("admin.common.unsaved_changes_dialog.message_before")}
        messageHighlight={t("admin.common.unsaved_changes_dialog.message_highlight")}
        messageAfter={t("admin.common.unsaved_changes_dialog.message_after")}
        stayText={t("admin.common.unsaved_changes_dialog.stay")}
        exitText={t("admin.common.unsaved_changes_dialog.exit")}
        onExit={resetDialog}
      />

      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.staff.bulk_delete.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              {t("admin.staff.bulk_delete.description", { count: selected.size })}
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("admin.staff.form.cancel")}
            </LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete} loading={isBulkDeleting}>
              {t("admin.staff.bulk_confirm_delete")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}
