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
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { Select } from "antd";
import vnCityDistricts from "@/src/@core/const/location/vn-city-districts.json";

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
  const [items, setItems] = useState<CinemaOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<CinemaOutputDto | null>(null);
  const [form, setForm] = useState({
    name: "",
    city: "",
    ward: "",
    address: "",
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
      if (res && res.items) setItems(res.items);
    },
    onError: (err) => toast.error(err.message || "Lỗi tải danh sách rạp")
  });

  const createMutation = useLTTMutation<CinemaOutputDto | undefined, CreateCinemaInputDto>({
    mutationFn: (input) => cinemaService.createCinemaAsync(input),
    onSuccess: () => {
      toast.success("Tạo rạp thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const updateMutation = useLTTMutation<CinemaOutputDto | undefined, { id: string, body: UpdateCinemaInputDto }>({
    mutationFn: (input) => cinemaService.updateCinemaAsync(input.id, input.body),
    onSuccess: () => {
      toast.success("Cập nhật rạp thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const removeMutation = useLTTMutation<boolean, string>({
    mutationFn: async (id) => { await cinemaService.deleteCinemaAsync(id); return true; },
    onSuccess: () => {
      toast.success("Xóa rạp thành công");
    },
    onError: (err) => toast.error(err.message || "Có lỗi xảy ra")
  });

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading || removeMutation.isLoading;

  const fetchData = () => {
    listMutation.mutation({ page, fetch, keyword: debouncedSearch });
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
    setEditing(null);
    setForm({
      name: "",
      city: "",
      ward: "",
      address: "",
      serviceNumber: "",
      status: "active",
    });
    setDialogOpen(true);
  };
  const openEdit = (item: CinemaOutputDto) => {
    setEditing(item);
    setForm({
      name: item.name,
      city: resolveCityValue(item.city),
      ward: item.ward || "",
      address: item.address || "",
      serviceNumber: item.serviceNumber || "",
      status: item.status || "active",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Tên rạp không được để trống");
      return;
    }

    if (editing) {
      updateMutation.mutation({ id: editing.id, body: form });
    } else {
      createMutation.mutation(form);
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      return;
    }

    const results = await Promise.allSettled(ids.map((id) => cinemaService.deleteCinemaAsync(id)));
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed === 0) {
      toast.success(`Xóa ${ids.length} rạp thành công`);
    } else {
      toast.error(`Xóa thành công ${ids.length - failed}/${ids.length} rạp`);
    }

    setSelected(new Set());
    setDeleteOpen(false);
    fetchData();
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
              <th className="px-4 py-3 text-left font-semibold">STT</th>
              <th className="px-4 py-3 text-left font-semibold">Tên rạp</th>
              <th className="px-4 py-3 text-left font-semibold">Thành phố</th>
              <th className="px-4 py-3 text-left font-semibold">Địa chỉ</th>
              <th className="px-4 py-3 text-left font-semibold">Phòng chiếu</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Đang tải dữ liệu rạp...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Không có dữ liệu rạp chiếu nào phù hợp.
                </td>
              </tr>
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
                  <td className="px-4 py-3 text-muted-foreground-shadcn max-w-xs truncate">
                    {item.address}
                  </td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={`font-medium ${statusColors[item.status || "active"] || statusColors.active}`}
                    >
                      {item.status === "active"
                        ? "Hoạt động"
                        : item.status === "maintenance"
                          ? "Bảo trì"
                          : item.status === "closed" ? "Đóng cửa" : item.status || "Hoạt động"}
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
                        onClick={async () => {
                          await removeMutation.mutation(item.id);
                          fetchData();
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
              <LTTLabel>Thành phố</LTTLabel>
              <Select
                value={form.city}
                options={cityOptions}
                allowClear
                showSearch
                getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                placeholder="Chọn hoặc tìm thành phố"
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
              <LTTLabel>Xã/Phường</LTTLabel>
              <Select
                value={form.ward}
                options={districtOptions}
                allowClear
                showSearch
                disabled={!form.city}
                getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
                placeholder={form.city ? "Chọn hoặc tìm xã/phường" : "Vui lòng chọn thành phố trước"}
                className="w-full"
                optionFilterProp="label"
                onChange={(value) => setForm({ ...form, ward: String(value || "") })}
                filterOption={(inputValue, option) =>
                  String(option?.label ?? "").toLowerCase().includes(inputValue.toLowerCase())
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
                value={form.serviceNumber}
                onChange={(e) => setForm({ ...form, serviceNumber: e.target.value })}
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

      <div className="flex items-center justify-between rounded-lg border border-border-shadcn bg-card px-4 py-3">
        <div className="text-sm text-muted-foreground-shadcn">
          Tổng: {listMutation.data?.totalCount ?? items.length} rạp
        </div>
        <div className="flex items-center gap-2">
          <LTTSelect value={String(fetch)} onValueChange={(v) => setFetch(Number(v))}>
            <LTTSelectTrigger className="w-24">
              <LTTSelectValue />
            </LTTSelectTrigger>
            <LTTSelectContent>
              <LTTSelectItem value="10">10</LTTSelectItem>
              <LTTSelectItem value="20">20</LTTSelectItem>
              <LTTSelectItem value="50">50</LTTSelectItem>
            </LTTSelectContent>
          </LTTSelect>
          <LTTButton variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Trước
          </LTTButton>
          <span className="text-sm">Trang {page}</span>
          <LTTButton
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * fetch >= (listMutation.data?.totalCount ?? 0)}
          >
            Sau
          </LTTButton>
        </div>
      </div>

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
