"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Coffee } from "lucide-react";
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
import { productService } from "@/src/services/administration-service/product/product.service";
import { ProductOutputDto, CategoryOutputDto } from "@/src/services/administration-service/product/models/output.model";
import { GetProductListInputDto, CreateProductInputDto, UpdateProductInputDto } from "@/src/services/administration-service/product/models/input.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { useEffect } from "react";
import { cn } from "@/src/@core/utils/cn";

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
  const [items, setItems] = useState<ProductOutputDto[]>([]);
  const [categories, setCategories] = useState<CategoryOutputDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<ProductOutputDto | null>(null);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: 0,
    description: "",
  });

  const listMutation = useLTTMutation<PagedResultDto<ProductOutputDto> | undefined, GetProductListInputDto>({
    mutationFn: (input) => productService.getProductListAsync(input),
    onSuccess: (res) => { if (res && res.items) setItems(res.items); },
    onError: (err) => toast.error(err.message || "Lỗi tải danh sách sản phẩm")
  });

  const catMutation = useLTTMutation<PagedResultDto<CategoryOutputDto> | undefined, void>({
    mutationFn: () => productService.getCategoryListAsync(),
    onSuccess: (res) => { if (res && res.items) setCategories(res.items); }
  });

  const createMutation = useLTTMutation<ProductOutputDto | undefined, CreateProductInputDto>({
    mutationFn: (input) => productService.createProductAsync(input),
    onSuccess: () => {
      toast.success("Thêm thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Lỗi")
  });

  const updateMutation = useLTTMutation<ProductOutputDto | undefined, { id: string; body: UpdateProductInputDto }>({
    mutationFn: (input) => productService.updateProductAsync(input.id, input.body),
    onSuccess: () => {
      toast.success("Cập nhật thành công");
      fetchData();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message || "Lỗi")
  });

  const fetchData = () => {
    listMutation.mutation({
      page: 1,
      fetch: 100,
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
  }, [debouncedSearch, catFilter]);

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
      toast.error("Tên sản phẩm không được để trống");
      return;
    }
    if (editing) {
      updateMutation.mutation({ id: editing.id, body: form as UpdateProductInputDto });
    } else {
      createMutation.mutation(form as CreateProductInputDto);
    }
  };

  const bulkDelete = () => {
    setItems((p) => p.filter((i) => !selected.has(i.id)));
    toast.success(`Đã xóa ${selected.size} sản phẩm`);
    setSelected(new Set());
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Quản lý F&B</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </LTTButton>
      </div>

      <LTTTabs value={catFilter} onValueChange={setCatFilter}>
        <LTTTabsList className="bg-muted-shadcn/50">
          <LTTTabsTrigger value="all">
            Tất cả ({items.length})
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
            placeholder="Tìm sản phẩm..."
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
              <th className="px-4 py-3 text-left font-semibold">Sản phẩm</th>
              <th className="px-4 py-3 text-left font-semibold">Danh mục</th>
              <th className="px-4 py-3 text-right font-semibold">Giá bán</th>
              <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Không tìm thấy sản phẩm nào.
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
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-primary-shadcn opacity-50" />
                    {item.name}
                  </td>
                  <td className="px-4 py-3">
                    <LTTBadge className="bg-accent-shadcn text-accent-shadcn-foreground border-red-200">
                      {item.categoryName || "Sản phẩm"}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatVND(item.price)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground-shadcn max-w-[200px] truncate">
                    {item.description || "—"}
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
                          setItems((p) => p.filter((i) => i.id !== item.id));
                          toast.success("Đã xóa sản phẩm " + item.name);
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
              {editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Tên sản phẩm *</LTTLabel>
              <LTTInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Danh mục *</LTTLabel>
              <LTTSelect
                value={form.categoryId}
                onValueChange={(v: any) => setForm({ ...form, categoryId: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue placeholder="Chọn danh mục" />
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
              <LTTLabel>Giá bán (VNĐ) *</LTTLabel>
              <LTTInput
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Mô tả sản phẩm</LTTLabel>
              <LTTTextarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Mô tả thành phần, kích thước..."
              />
            </div>
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </LTTButton>
            <LTTButton onClick={save}>
              {editing ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa sản phẩm</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> sản phẩm
              đã chọn khỏi danh mục?
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
