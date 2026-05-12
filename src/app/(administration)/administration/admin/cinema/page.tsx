"use client";

import { useState, useEffect, useMemo } from "react";
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
import { cinemaService } from "@/src/services/administration-service/cinema/cinema.service";
import { CinemaOutputDto } from "@/src/services/administration-service/cinema/models/output.model";
import { GetCinemaListInputDto, CreateCinemaInputDto, UpdateCinemaInputDto } from "@/src/services/administration-service/cinema/models/input.model";
import { employeeService } from "@/src/services/administration-service/employee/employee.service";
import { EmployeeOutputDto } from "@/src/services/administration-service/employee/models/output.model";
import { screenService } from "@/src/services/administration-service/screen/screen.service";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { Select } from "antd";
import vnCityDistricts from "@/src/@core/const/location/vn-city-districts.json";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import AdminTablePagination from "../_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";
import { formatDateTimeValueGmt7 } from "@/src/@core/utils/date";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  closed: "bg-red-100 text-red-700 border-red-200",
};

type CityDistrictData = {
  city: string;
  wards: string[];
};

export default function CinemaConfigPage() {
  const { t } = useLocalization();
  const [items, setItems] = useState<CinemaOutputDto[]>([]);
  const [managers, setManagers] = useState<EmployeeOutputDto[]>([]);
  const [managersLoaded, setManagersLoaded] = useState(false);
  const [managerPage, setManagerPage] = useState(1);
  const [managerHasMore, setManagerHasMore] = useState(true);
  const MANAGER_PAGE_SIZE = 100;
  const [screenCountByCinema, setScreenCountByCinema] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [editing, setEditing] = useState<CinemaOutputDto | null>(null);
  const [form, setForm] = useState({
    name: "",
    city: "",
    ward: "",
    address: "",
    managerUserId: "",
    serviceNumber: "",
    status: "active" as any,
  });
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const cityDistrictOptions = vnCityDistricts as CityDistrictData[];
  const cityOptions = useMemo(
    () => cityDistrictOptions.map((item) => ({ label: item.city, value: item.city })),
    [cityDistrictOptions],
  );

  const resolveCityValue = (city?: string) => {
    if (!city) {
      return "";
    }

    const exactMatch = cityDistrictOptions.find((item) => item.city === city);
    if (exactMatch) {
      return exactMatch.city;
    }

    const suffixMatch = cityDistrictOptions.find((item) => item.city.endsWith(city));
    if (suffixMatch) {
      return suffixMatch.city;
    }

    return city;
  };

  const districtOptions = useMemo(() => {
    const selectedCity = cityDistrictOptions.find((item) => item.city === form.city);
    const mapped = (selectedCity?.wards ?? []).map((ward) => ({
      label: ward,
      value: ward,
    }));

    if (form.ward && !mapped.some((option) => option.value === form.ward)) {
      mapped.unshift({ label: form.ward, value: form.ward });
    }

    return mapped;
  }, [cityDistrictOptions, form.city, form.ward]);

  const listMutation = useLTTMutation<PagedResultDto<CinemaOutputDto> | undefined, GetCinemaListInputDto>({
    mutationFn: (input) => cinemaService.getCinemaListAsync(input),
    onSuccess: (res) => {
      if (res && res.items) {
        setItems(res.items);
        ensureManagersLoaded();
        void fetchScreenCounts(res.items);
      }
    },
    onError: (err) => toast.error(err.message || t("admin.cinema_configuration.fetch_error"))
  });

  const createMutation = useLTTMutation<CinemaOutputDto | undefined, CreateCinemaInputDto>({
    mutationFn: (input) => cinemaService.createCinemaAsync(input),
    onSuccess: () => {
      toast.success(t("admin.cinema_configuration.create_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.cinema_configuration.generic_error"))
  });

  const updateMutation = useLTTMutation<CinemaOutputDto | undefined, { id: string, body: UpdateCinemaInputDto }>({
    mutationFn: (input) => cinemaService.updateCinemaAsync(input.id, input.body),
    onSuccess: () => {
      toast.success(t("admin.cinema_configuration.update_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.cinema_configuration.generic_error"))
  });

  const removeMutation = useLTTMutation<boolean, string>({
    mutationFn: async (id) => { await cinemaService.deleteCinemaAsync(id); return true; },
    onSuccess: () => {
      toast.success(t("admin.cinema_configuration.delete_success"));
    },
    onError: (err) => toast.error(err.message || t("admin.cinema_configuration.generic_error"))
  });

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || removeMutation.isLoading;
  const managersMutation = useLTTMutation({
    mutationFn: (params: { page: number; append: boolean }) =>
      employeeService.getEmployeeListAsync({ page: params.page, fetch: MANAGER_PAGE_SIZE }),
    onSuccess: (res) => {
      const managerList = (res?.items || []).filter((employee) => (employee.role || "").toLowerCase() === "manager");
      const mutationParams = managersMutation.input as { page: number; append: boolean } | null;
      const shouldAppend = Boolean(mutationParams?.append);

      setManagers((prev) => {
        if (!shouldAppend) {
          return managerList;
        }

        const existingIds = new Set(prev.map((employee) => employee.id));
        const merged = [...prev];
        managerList.forEach((employee) => {
          if (!existingIds.has(employee.id)) {
            merged.push(employee);
          }
        });
        return merged;
      });

      const receivedCount = res?.items?.length ?? 0;
      setManagerHasMore(receivedCount === MANAGER_PAGE_SIZE);
      setManagersLoaded(true);
    },
    onError: (err) => toast.error(err.message || t("admin.cinema_configuration.fetch_error")),
  });

  const fetchData = () => {
    // Safeguard: cap page number to prevent overflow errors
    const safePage = Math.min(Math.max(1, page), 1000000);
    listMutation.mutation({ page: safePage, fetch, keyword: debouncedSearch });
  };

  const fetchScreenCounts = async (cinemas: CinemaOutputDto[]) => {
    const pairs = await Promise.all(
      cinemas.map(async (cinema) => {
        try {
          const result = await screenService.getScreenListAsync(cinema.id, { page: 1, fetch: 1 });
          return [cinema.id, result.totalCount ?? result.items?.length ?? 0] as const;
        } catch {
          return [cinema.id, 0] as const;
        }
      })
    );

    setScreenCountByCinema(Object.fromEntries(pairs));
  };

  const ensureManagersLoaded = () => {
    if (!managersLoaded && !managersMutation.isLoading) {
      setManagerPage(1);
      setManagerHasMore(true);
      managersMutation.mutation({ page: 1, append: false });
    }
  };

  const loadMoreManagers = () => {
    if (managersMutation.isLoading || !managerHasMore) {
      return;
    }

    const nextPage = managerPage + 1;
    setManagerPage(nextPage);
    managersMutation.mutation({ page: nextPage, append: true });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [page, fetch, debouncedSearch]);

  const allSel = items.length > 0 && items.every((i) => selected.has(i.id));
  const toggleAll = () =>
    allSel
      ? setSelected(new Set())
      : setSelected(new Set(items.map((i) => i.id)));
  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const openCreate = () => {
    ensureManagersLoaded();
    setEditing(null);
    setForm({
      name: "",
      city: "",
      ward: "",
      address: "",
      managerUserId: "",
      serviceNumber: "",
      status: "active",
    });
    setDialogOpen(true);
  };
  const openEdit = (item: CinemaOutputDto) => {
    ensureManagersLoaded();
    setEditing(item);
    setForm({
      name: item.name,
      city: resolveCityValue(item.city),
      ward: item.ward || "",
      address: item.address || "",
      managerUserId: item.managerUserId || "",
      serviceNumber: item.serviceNumber || "",
      status: item.status || "active",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error(t("admin.cinema_configuration.name_required"));
      return;
    }

    if (editing) {
      updateMutation.mutation({ id: editing.id, body: form });
    } else {
      createMutation.mutation(form);
    }
  };

  const bulkDelete = async () => {
    if (isBulkDeleting) {
      return;
    }

    const ids = Array.from(selected);
    if (ids.length === 0) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => cinemaService.deleteCinemaAsync(id)));
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(t("admin.cinema_configuration.bulk_delete_success", { count: ids.length }));
      } else {
        toast.error(t("admin.cinema_configuration.bulk_delete_partial", { successCount: ids.length - failed, count: ids.length }));
      }

      setSelected(new Set());
      setDeleteOpen(false);
      fetchData();
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getManagerName = (cinema: CinemaOutputDto) => {
    if (!cinema.managerUserId) {
      return "-";
    }

    const matchedManager = managers.find((manager) =>
      (manager.userId === cinema.managerUserId || manager.id === cinema.managerUserId) &&
      manager.cinemaId === cinema.id
    );
    if (matchedManager?.name) {
      return matchedManager.name;
    }

    const managerByUserId = managers.find(
      (manager) => manager.userId === cinema.managerUserId || manager.id === cinema.managerUserId
    );
    return managerByUserId?.name || "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.cinema_configuration.title")}</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> {t("admin.cinema_configuration.add")}
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.cinema_configuration.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <LTTButton
          variant="outline"
          className="gap-2"
          onClick={fetchData}
          loading={listMutation.isLoading}
        >
          <RefreshCw className="h-4 w-4" /> {t("admin.cinema_configuration.refresh")}
        </LTTButton>
        {selected.size > 0 && (
          <LTTButton
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> {t("admin.common.delete_confirm.ok")} {selected.size}
          </LTTButton>
        )}
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full text-sm table-auto">
            <thead>
              <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                <th className="w-10 px-3 py-3">
                  <LTTCheckbox checked={allSel} onCheckedChange={toggleAll} />
                </th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.table.index")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.table.name")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.table.city")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.table.address")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.form.phone")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.table.manager_name") || "Manager Name"}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.table.screens")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.table.status")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.table.created")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("admin.cinema_configuration.table.updated")}</th>
                <th className="sticky right-0 z-20 px-4 py-3 text-right font-semibold bg-muted-shadcn/95">
                  {t("admin.cinema_configuration.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <DomainTableStateRow colSpan={12} state="loading" loadingText={t("admin.cinema_configuration.loading")} />
              ) : items.length === 0 ? (
                <DomainTableStateRow colSpan={12} state="empty" emptyText={t("admin.cinema_configuration.empty")} />
              ) : (
                items.map((item, idx) => (
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
                    <td className="px-4 py-3">{item.city || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground-shadcn max-w-[220px] truncate">
                      {item.address}
                    </td>
                    <td className="px-4 py-3 max-w-[140px] truncate">{item.serviceNumber || "-"}</td>
                    <td className="px-4 py-3 max-w-[180px] truncate">{getManagerName(item)}</td>
                    <td className="px-4 py-3">{screenCountByCinema[item.id] ?? 0}</td>
                    <td className="px-4 py-3">
                      <LTTBadge
                        className={`font-medium ${statusColors[item.status || "active"] || statusColors.active}`}
                      >
                        {item.status === "active"
                          ? t("admin.cinema_configuration.status.active")
                          : item.status === "maintenance"
                            ? t("admin.cinema_configuration.status.maintenance")
                            : item.status === "closed" ? t("admin.cinema_configuration.status.closed") : item.status || t("admin.cinema_configuration.status.active")}
                      </LTTBadge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground-shadcn text-xs whitespace-nowrap">
                      {formatDateTimeValueGmt7(item.createdAt) || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground-shadcn text-xs whitespace-nowrap">
                      {formatDateTimeValueGmt7(item.updatedAt) || "—"}
                    </td>
                    <td className="sticky right-0 z-10 px-4 py-3 bg-card">
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
                          title={t("admin.cinema_configuration.delete_confirm.single_title")}
                          description={t("admin.cinema_configuration.delete_confirm.single_message")}
                          confirmText={t("admin.cinema_configuration.delete_confirm.ok")}
                          cancelText={t("admin.cinema_configuration.delete_confirm.cancel")}
                          onConfirm={async () => {
                            await removeMutation.mutation(item.id);
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
      </div>

      <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>
              {editing ? t("admin.cinema_configuration.form.edit_title") : t("admin.cinema_configuration.form.create_title")}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>{t("admin.cinema_configuration.form.name")}</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.cinema_configuration.form.city")}</LTTLabel>
              <Select
                value={form.city}
                options={cityOptions}
                allowClear
                showSearch
                getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                placeholder={t("admin.cinema_configuration.form.city_placeholder")}
                className="w-full"
                optionFilterProp="label"
                onChange={(value) => setForm({
                  ...form,
                  city: String(value || ""),
                  ward: "",
                })}
                filterOption={(inputValue, option) =>
                  String(option?.label ?? "").toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.cinema_configuration.form.ward")}</LTTLabel>
              <Select
                value={form.ward}
                options={districtOptions}
                allowClear
                showSearch
                disabled={!form.city}
                getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                placeholder={form.city ? t("admin.cinema_configuration.form.ward_placeholder") : t("admin.cinema_configuration.form.ward_placeholder_disabled")}
                className="w-full"
                optionFilterProp="label"
                onChange={(value) => setForm({ ...form, ward: String(value || "") })}
                filterOption={(inputValue, option) =>
                  String(option?.label ?? "").toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.cinema_configuration.form.status")}</LTTLabel>
              <LTTSelect
                value={form.status}
                onValueChange={(v: any) => setForm({ ...form, status: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="active">{t("admin.cinema_configuration.status.active")}</LTTSelectItem>
                  <LTTSelectItem value="maintenance">{t("admin.cinema_configuration.status.maintenance")}</LTTSelectItem>
                  <LTTSelectItem value="closed">{t("admin.cinema_configuration.status.closed")}</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>{t("admin.cinema_configuration.form.address")}</LTTLabel>
              <LTTInput
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.cinema_configuration.form.manager") || "Manager"}</LTTLabel>
              <LTTSelect
                value={form.managerUserId}
                onValueChange={(value) => setForm({ ...form, managerUserId: value })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder={t("admin.cinema_configuration.form.select_manager_placeholder") || "Select manager"} />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {managersMutation.isLoading ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">{t("admin.cinema_configuration.loading")}</div>
                  ) : managers.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground-shadcn">{t("admin.cinema_configuration.empty")}</div>
                  ) : (
                    <>
                      {managers.map((manager) => (
                        <LTTSelectItem key={manager.id} value={manager.userId || manager.id}>
                          {manager.name}
                        </LTTSelectItem>
                      ))}
                      {managerHasMore && (
                        <div className="px-2 py-1 border-t border-border-shadcn">
                          <LTTButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center"
                            onClick={loadMoreManagers}
                            loading={managersMutation.isLoading}
                          >
                            {t("admin.common.load_more") || "Load more"}
                          </LTTButton>
                        </div>
                      )}
                    </>
                  )}
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.cinema_configuration.form.phone")}</LTTLabel>
              <LTTInput
                value={form.serviceNumber}
                onChange={(e) => setForm({ ...form, serviceNumber: e.target.value })}
              />
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>
              {t("admin.cinema_configuration.form.cancel")}
            </LTTButton>
            <LTTButton onClick={save} loading={createMutation.isLoading || updateMutation.isLoading}>
              {editing ? t("admin.cinema_configuration.form.save") : t("admin.cinema_configuration.form.create")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <AdminTablePagination
        totalCount={listMutation.data?.totalCount ?? items.length}
        page={page}
        pageSize={fetch}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPage(1);
          setFetch(size);
        }}
        loading={listMutation.isLoading}
      />

      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.cinema_configuration.delete_confirm.bulk_title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              {t("admin.cinema_configuration.delete_confirm.bulk_message", { count: selected.size })}
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("admin.cinema_configuration.delete_confirm.cancel")}
            </LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete} loading={isBulkDeleting}>
              {t("admin.cinema_configuration.delete_confirm.confirm")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}
