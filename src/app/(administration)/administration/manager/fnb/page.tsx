"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Coffee, RefreshCw } from "lucide-react";
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
  LTTTabs,
  LTTTabsContent,
  LTTTabsList,
  LTTTabsTrigger,
} from "@/src/@core/component/LTTShadcnUI/LTTTabs";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { managerFnbService as productService } from "@/src/services/administration-service/manager/fnb/fnb.service";
import { ProductOutputDto, CategoryOutputDto } from "@/src/services/administration-service/product/models/output.model";
import { GetProductListInputDto, CreateProductInputDto, UpdateProductInputDto } from "@/src/services/administration-service/product/models/input.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { useEffect } from "react";
import { cn } from "@/src/@core/utils/cn";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

const catLabel: Record<string, string> = {
  popcorn: "Bắp rang",
  drink: "Nước uống",
  combo: "Combo",
  snack: "Snack",
  other: "Khác",
};
const statusColor: Record<string, string> = {
  available: "bg-green-100 text-green-700 border-green-200",
  out_of_stock: "bg-amber-100 text-amber-700 border-amber-200",
  discontinued: "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
};
const statusLabel: Record<string, string> = {
  available: "Có sẵn",
  out_of_stock: "Hết hàng",
  discontinued: "Ngưng bán",
};

const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function FnBPage() {
  const { t } = useLocalization();
  const [items, setItems] = useState<ProductOutputDto[]>([]);
  const [categories, setCategories] = useState<CategoryOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ProductOutputDto | null>(null);
  const [singleDeleteId, setSingleDeleteId] = useState("");
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: 0,
    description: "",
  });

  const listMutation = useLTTMutation<PagedResultDto<ProductOutputDto> | undefined, GetProductListInputDto>({
    mutationFn: (input) => productService.getProductListAsync(input),
    onSuccess: (res) => {
      if (res && res.items) {
        setItems(res.items);
        setTotalCount(res.totalCount);
      }
    },
    onError: (err) => toast.error(err.message || t("admin.fnb.fetch_error"))
  });

  const catMutation = useLTTMutation<PagedResultDto<CategoryOutputDto> | undefined, void>({
    mutationFn: () => productService.getCategoryListAsync(),
    onSuccess: (res) => { if (res && res.items) setCategories(res.items); }
  });

  const createMutation = useLTTMutation<ProductOutputDto | undefined, CreateProductInputDto>({
    mutationFn: (input) => productService.createProductAsync(input),
    onSuccess: () => {
      toast.success(t("admin.fnb.create_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.fnb.generic_error"))
  });

  const updateMutation = useLTTMutation<ProductOutputDto | undefined, { id: string; body: UpdateProductInputDto }>({
    mutationFn: (input) => productService.updateProductAsync(input.id, input.body),
    onSuccess: () => {
      toast.success(t("admin.fnb.update_success"));
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || t("admin.fnb.generic_error"))
  });

  const fetchData = () => {
    listMutation.mutation({
      page,
      fetch,
      keyword: debouncedSearch,
      categoryId: catFilter === "all" ? undefined : catFilter
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, catFilter, page]);

  useEffect(() => {
    catMutation.mutation();
  }, []);

  const loading = listMutation.isLoading || createMutation.isLoading || updateMutation.isLoading;

  const filtered = useMemo(() => items, [items]);

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
      categoryId: categories.length > 0 ? categories[0].id : "",
      price: 0,
      description: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: ProductOutputDto) => {
    setEditing(item);
    setForm({
      name: item.name,
      categoryId: item.categoryId,
      price: item.price,
      description: item.description || "",
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error(t("admin.fnb.validation.name_required"));
      return;
    }
    if (editing) {
      updateMutation.mutation({ id: editing.id, body: form as UpdateProductInputDto });
    } else {
      createMutation.mutation(form as CreateProductInputDto);
    }
  };

  const bulkDelete = () => {
    Promise.allSettled(Array.from(selected).map((id) => productService.deleteProductAsync(id))).then(() => {
      toast.success(t("admin.fnb.bulk_delete_success", { count: selected.size }));
      setSelected(new Set());
      setDeleteOpen(false);
      fetchData();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.fnb.title")}</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> {t("admin.fnb.add")}
        </LTTButton>
      </div>

      <LTTTabs value={catFilter} onValueChange={(v) => { setCatFilter(v); setPage(1); }}>
        <LTTTabsList className="bg-muted-shadcn/50">
          <LTTTabsTrigger value="all">
            {t("admin.fnb.tabs.all", { count: items.length })}
          </LTTTabsTrigger>
          {categories.map((c) => (
            <LTTTabsTrigger key={c.id} value={c.id}>
              {c.name}
            </LTTTabsTrigger>
          ))}
        </LTTTabsList>
      </LTTTabs>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.fnb.search_placeholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
            <Trash2 className="h-4 w-4" /> {t("admin.common.delete_confirm.ok")} {selected.size}
          </LTTButton>
        )}
        <LTTButton
          variant="outline"
          className="gap-2"
          onClick={() => {
            setPage(1);
            listMutation.mutation({
              page: 1,
              fetch,
              keyword: search ?? "",
              categoryId: catFilter === "all" ? undefined : catFilter,
            });
          }}
          loading={listMutation.isLoading}
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </LTTButton>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSel} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.fnb.table.index")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.fnb.table.product")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.fnb.table.category")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("admin.fnb.table.price")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.fnb.table.description")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("admin.fnb.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <DomainTableStateRow colSpan={9} state="loading" loadingText={t("admin.fnb.loading")} />
            ) : filtered.length === 0 ? (
              <DomainTableStateRow colSpan={9} state="empty" emptyText={t("admin.fnb.empty")} />
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
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-primary-shadcn opacity-50" />
                    {item.name}
                  </td>
                  <td className="px-4 py-3">
                    <LTTBadge className="bg-accent-shadcn text-accent-shadcn-foreground border-red-200">
                      {item.categoryName || t("admin.fnb.fallback_product")}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatVND(item.price)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground-shadcn max-w-[200px] truncate">
                    {item.description || t("admin.fnb.empty_value")}
                  </td>
                  <td className="px-4 py-3 text-right">
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
                          setSingleDeleteId(item.id);
                          setSingleDeleteOpen(true);
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
      <AdminTablePagination
        totalCount={totalCount}
        page={page}
        pageSize={fetch}
        onPageChange={(nextPage) => {
          setPage(nextPage);
        }}
        onPageSizeChange={(nextSize) => {
          setFetch(nextSize);
          setPage(1);
        }}
        loading={listMutation.isLoading}
      />

      <LTTDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>
              {editing ? t("admin.fnb.form.edit_title") : t("admin.fnb.form.create_title")}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>{t("admin.fnb.form.name")}</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.fnb.form.category")}</LTTLabel>
              <LTTSelect
                value={form.categoryId}
                onValueChange={(v: string) => setForm({ ...form, categoryId: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder={t("admin.fnb.form.category_placeholder")} />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  {categories.map((c) => (
                    <LTTSelectItem key={c.id} value={c.id}>
                      {c.name}
                    </LTTSelectItem>
                  ))}
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>{t("admin.fnb.form.price")}</LTTLabel>
              <LTTInput
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>{t("admin.fnb.form.description")}</LTTLabel>
              <LTTTextarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder={t("admin.fnb.form.description_placeholder")}
              />
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>
              {t("admin.common.delete_confirm.cancel")}
            </LTTButton>
            <LTTButton onClick={save}>
              {editing ? t("admin.fnb.form.save") : t("admin.fnb.form.create")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.fnb.delete_confirm.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              {t("admin.fnb.delete_confirm.message", { count: selected.size })}
            </p>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("admin.common.delete_confirm.cancel")}
            </LTTButton>
            <LTTButton variant="destructive" onClick={bulkDelete}>
              {t("admin.fnb.delete_confirm.confirm")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
      <LTTDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>{t("admin.common.delete_confirm.title")}</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-3 text-sm text-muted-foreground-shadcn">{t("admin.fnb.delete_confirm.message", { count: 1 })}</div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setSingleDeleteOpen(false)}>
              {t("admin.common.delete_confirm.cancel")}
            </LTTButton>
            <LTTButton
              variant="destructive"
              onClick={async () => {
                await productService.deleteProductAsync(singleDeleteId);
                toast.success(t("admin.fnb.delete_single_success", { name: "" }));
                setSingleDeleteOpen(false);
                fetchData();
              }}
            >
              {t("admin.common.delete_confirm.ok")}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}
