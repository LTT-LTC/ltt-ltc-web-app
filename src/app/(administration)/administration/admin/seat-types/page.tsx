"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";
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
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import useDebouncedListQuery from "@/src/@core/hooks/useDebouncedListQuery";
import { seatTypeService } from "@/src/services/administration-service/seat-type/seat-type.service";
import { SeatTypeOutputDto } from "@/src/services/administration-service/seat-type/models/output.model";
import { GetSeatTypeListInputDto, CreateSeatTypeInputDto, UpdateSeatTypeInputDto } from "@/src/services/administration-service/seat-type/models/input.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

const SEAT_COLOR_HEX = /^#[0-9A-Fa-f]{6}$/;
const DEFAULT_SEAT_COLOR = "#2563EB";

const normalizeSeatColorHex = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return withHash.toUpperCase();
};

const PRESET_SEAT_COLORS = [
  "#2563EB",
  "#F59E0B",
  "#EC4899",
  "#A855F7",
  "#22C55E",
  "#EF4444",
  "#14B8A6",
  "#78716C",
  "#1F2937",
  "#EAB308",
];

export default function SeatTypesAdminPage() {
  const { t } = useLocalization();
  const [items, setItems] = useState<SeatTypeOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<SeatTypeOutputDto | null>(null);

  const [seatColorPaletteOpen, setSeatColorPaletteOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    numberOfSeat: 1,
    displayDirection: "HORIZONTAL",
    priceMultiplier: 1.0,
    seatColor: DEFAULT_SEAT_COLOR,
  });

  const listMutation = useLTTMutation<PagedResultDto<SeatTypeOutputDto> | undefined, GetSeatTypeListInputDto>({
    mutationFn: (input) => seatTypeService.getSeatTypeListAsync(input),
    onSuccess: (res) => {
      if (res && res.items) setItems(res.items);
    },
    onError: (err) => toast.error(err.message || t("admin.seat_type.fetch_error"))
  });

  const createMutation = useLTTMutation<SeatTypeOutputDto | undefined, CreateSeatTypeInputDto>({
    mutationFn: (input) => seatTypeService.createSeatTypeAsync(input),
    onSuccess: () => {
      toast.success(t("admin.seat_type.create_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.seat_type.generic_error"))
  });

  const updateMutation = useLTTMutation<SeatTypeOutputDto | undefined, { id: string; body: UpdateSeatTypeInputDto }>({
    mutationFn: (input) => seatTypeService.updateSeatTypeAsync(input.id, input.body),
    onSuccess: () => {
      toast.success(t("admin.seat_type.update_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.seat_type.generic_error"))
  });

  const removeMutation = useLTTMutation<boolean, string>({
    mutationFn: async (id) => { await seatTypeService.deleteSeatTypeAsync(id); return true; },
    onSuccess: () => {
      toast.success(t("admin.seat_type.delete_success"));
    },
    onError: (err) => toast.error(err.message || t("admin.seat_type.generic_error"))
  });

  const fetchData = (keyword?: string) => {
    const effectiveKeyword = keyword ?? debouncedSearch;
    listMutation.mutation({ page: 1, fetch: 100, keyword: effectiveKeyword });
  };

  const debouncedSearch = useDebouncedListQuery(search, (keyword) => fetchData(keyword));

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
      seatColor: DEFAULT_SEAT_COLOR,
    });
    setSeatColorPaletteOpen(false);
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
      seatColor: item.seatColor?.trim() ? normalizeSeatColorHex(item.seatColor) : DEFAULT_SEAT_COLOR,
    });
    setSeatColorPaletteOpen(false);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error(t("admin.seat_type.validation.name_required"));
      return;
    }

    if (form.priceMultiplier < 0.5) {
      toast.error(t("admin.seat_type.validation.price_min"));
      return;
    }

    if (form.numberOfSeat < 1) {
      toast.error(t("admin.seat_type.validation.seat_min"));
      return;
    }

    if (!["HORIZONTAL", "VERTICAL"].includes(form.displayDirection)) {
      toast.error(t("admin.seat_type.validation.direction_invalid"));
      return;
    }

    const seatColorNorm = normalizeSeatColorHex(form.seatColor);
    if (seatColorNorm && !SEAT_COLOR_HEX.test(seatColorNorm)) {
      toast.error(t("admin.seat_type.validation.seat_color_invalid"));
      return;
    }

    const body: CreateSeatTypeInputDto = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      numberOfSeat: form.numberOfSeat,
      displayDirection: form.displayDirection,
      priceMultiplier: form.priceMultiplier,
      ...(seatColorNorm ? { seatColor: seatColorNorm } : {}),
    };

    if (editing) {
      updateMutation.mutation({ id: editing.id, body });
    } else {
      createMutation.mutation(body);
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      return;
    }

    const results = await Promise.allSettled(ids.map((id) => seatTypeService.deleteSeatTypeAsync(id)));
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed === 0) {
      toast.success(t("admin.seat_type.bulk_delete_success", { count: ids.length }));
    } else {
      toast.error(t("admin.seat_type.bulk_delete_partial", { successCount: ids.length - failed, count: ids.length }));
    }

    setSelected(new Set());
    setDeleteOpen(false);
    fetchData(debouncedSearch);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.seat_type.title")}</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> {t("admin.seat_type.add")}
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.seat_type.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <LTTButton
          variant="outline"
          className="gap-2"
          onClick={() => fetchData()}
          loading={listMutation.isLoading}
        >
          <RefreshCw className="h-4 w-4" /> {t("admin.seat_type.refresh")}
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSel} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seat_type.table.name")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seat_type.table.description")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seat_type.table.number_of_seat")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seat_type.table.seat_color")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seat_type.table.price_multiplier")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("admin.seat_type.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {listMutation.isLoading ? (
              <DomainTableStateRow colSpan={7} state="loading" loadingText={t("admin.common.loading")} />
            ) : filtered.length === 0 ? (
              <DomainTableStateRow colSpan={7} state="empty" emptyText={t("admin.seat_type.empty")} />
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-6 w-6 shrink-0 rounded border border-border-shadcn"
                        style={{ backgroundColor: item.seatColor && SEAT_COLOR_HEX.test(item.seatColor) ? item.seatColor : "#E5E7EB" }}
                        title={item.seatColor || undefined}
                      />
                      <span className="font-mono text-xs text-muted-foreground-shadcn">
                        {item.seatColor && SEAT_COLOR_HEX.test(item.seatColor) ? item.seatColor : "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-600">x{item.priceMultiplier}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <LTTButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </LTTButton>
                      <LTTConfirmDialog
                        title={t("admin.common.delete_confirm.title")}
                        description={t("admin.common.delete_confirm.message")}
                        confirmText={t("admin.common.delete_confirm.ok")}
                        cancelText={t("admin.common.delete_confirm.cancel")}
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

      <LTTDialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSeatColorPaletteOpen(false); }}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>{editing ? t("admin.seat_type.form.edit_title") : t("admin.seat_type.form.create_title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <LTTLabel>{t("admin.seat_type.form.name")}</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.seat_type.form.price_multiplier")}</LTTLabel>
              <LTTInput
                type="number"
                step="0.1"
                min="0.5"
                value={form.priceMultiplier}
                onChange={(e) => setForm({ ...form, priceMultiplier: parseFloat(e.target.value) || 0.5 })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.seat_type.form.number_of_seat")}</LTTLabel>
              <LTTInput
                type="number"
                min="1"
                value={form.numberOfSeat}
                onChange={(e) => setForm({ ...form, numberOfSeat: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.seat_type.form.display_direction")}</LTTLabel>
              <LTTSelect
                value={form.displayDirection}
                onValueChange={(v: "HORIZONTAL" | "VERTICAL") => setForm({ ...form, displayDirection: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="HORIZONTAL">{t("admin.seat_type.form.horizontal")}</LTTSelectItem>
                  <LTTSelectItem value="VERTICAL">{t("admin.seat_type.form.vertical")}</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>{t("admin.seat_type.form.description")}</LTTLabel>
              <LTTInput
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>{t("admin.seat_type.form.seat_color")}</LTTLabel>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="h-10 w-10 shrink-0 rounded-md border border-border-shadcn shadow-inner"
                  style={{
                    backgroundColor:
                      form.seatColor.trim() && SEAT_COLOR_HEX.test(normalizeSeatColorHex(form.seatColor))
                        ? normalizeSeatColorHex(form.seatColor)
                        : "#E5E7EB",
                  }}
                />
                <LTTInput
                  className="max-w-[140px] font-mono text-sm"
                  placeholder={t("admin.seat_type.form.seat_color_placeholder")}
                  value={form.seatColor}
                  onChange={(e) => setForm({ ...form, seatColor: e.target.value })}
                />
                <input
                  type="color"
                  className="h-10 w-14 cursor-pointer rounded border border-border-shadcn bg-transparent p-0"
                  value={
                    form.seatColor.trim() && SEAT_COLOR_HEX.test(normalizeSeatColorHex(form.seatColor))
                      ? normalizeSeatColorHex(form.seatColor)
                      : DEFAULT_SEAT_COLOR
                  }
                  onChange={(e) => setForm({ ...form, seatColor: e.target.value.toUpperCase() })}
                  aria-label={t("admin.seat_type.form.seat_color")}
                />
                <LTTButton type="button" variant="outline" size="sm" onClick={() => setSeatColorPaletteOpen((v) => !v)}>
                  {t("admin.seat_type.form.choose_seat_color")}
                </LTTButton>
              </div>
              {seatColorPaletteOpen && (
                <div className="rounded-lg border border-border-shadcn bg-muted-shadcn/30 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground-shadcn">{t("admin.seat_type.form.preset_colors")}</p>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                    {PRESET_SEAT_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        title={hex}
                        className="h-8 w-full rounded border border-border-shadcn shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring"
                        style={{ backgroundColor: hex }}
                        onClick={() => setForm({ ...form, seatColor: hex })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>{t("admin.seat_type.form.cancel")}</LTTButton>
            <LTTButton onClick={save}>{editing ? t("admin.seat_type.form.save") : t("admin.seat_type.form.create")}</LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.seat_type.delete_confirm.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              {t("admin.seat_type.delete_confirm.message", { count: selected.size })}
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>{t("admin.seat_type.delete_confirm.cancel")}</LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete}>{t("admin.seat_type.delete_confirm.confirm")}</LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}

