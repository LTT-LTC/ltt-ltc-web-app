"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Film } from "lucide-react";
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
import {
  LTTTabs,
  LTTTabsContent,
  LTTTabsList,
  LTTTabsTrigger,
} from "@/src/@core/component/LTTShadcnUI/LTTTabs";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { toast } from "sonner";
import { AdminMovie, mockAdminMovies } from "@/src/@core/const/mock/adminMockData";
import { cn } from "@/src/@core/utils/cn";

const statusLabel: Record<string, string> = {
  now_showing: "Đang chiếu",
  coming_soon: "Sắp chiếu",
  ended: "Đã kết thúc",
};
const statusColor: Record<string, string> = {
  now_showing: "bg-green-100 text-green-700 border-green-200",
  coming_soon: "bg-blue-100 text-blue-700 border-blue-200",
  ended: "bg-muted-shadcn text-muted-foreground-shadcn border-muted-shadcn",
};

export default function MoviesPage() {
  const [items, setItems] = useState<AdminMovie[]>(mockAdminMovies);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMovie | null>(null);
  const [form, setForm] = useState({
    title: "",
    genre: "",
    duration: "120",
    ageRating: "P",
    director: "",
    cast: "",
    releaseDate: "",
    endDate: "",
    status: "coming_soon" as AdminMovie["status"],
  });

  const filtered = useMemo(() => {
    let list = items;
    if (tab !== "all") list = list.filter((m) => m.status === tab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, search, tab]);

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
      title: "",
      genre: "",
      duration: "120",
      ageRating: "P",
      director: "",
      cast: "",
      releaseDate: "",
      endDate: "",
      status: "coming_soon",
    });
    setDialogOpen(true);
  };
  const openEdit = (m: AdminMovie) => {
    setEditing(m);
    setForm({
      title: m.title,
      genre: m.genre,
      duration: String(m.duration),
      ageRating: m.ageRating,
      director: m.director,
      cast: m.cast,
      releaseDate: m.releaseDate,
      endDate: m.endDate,
      status: m.status,
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.title.trim()) {
      toast.error("Tên phim không được để trống");
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    if (editing) {
      setItems((p) =>
        p.map((i) =>
          i.id === editing.id
            ? { ...i, ...form, duration: parseInt(form.duration) || 120 }
            : i
        )
      );
      toast.success("Cập nhật thành công");
    } else {
      setItems((p) => [
        ...p,
        {
          id: `m-${Date.now()}`,
          ...form,
          duration: parseInt(form.duration) || 120,
          posterUrl: "",
          trailerUrl: "",
          createdAt: now,
        },
      ]);
      toast.success("Tạo mới thành công");
    }
    setDialogOpen(false);
  };

  const bulkDelete = () => {
    setItems((p) => p.filter((i) => !selected.has(i.id)));
    toast.success(`Đã xóa ${selected.size} phim`);
    setSelected(new Set());
    setDeleteOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Quản lý phim</h1>
        <LTTButton onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm phim
        </LTTButton>
      </div>

      <LTTTabs value={tab} onValueChange={setTab}>
        <LTTTabsList className="bg-muted-shadcn/50">
          <LTTTabsTrigger value="all">
            Tất cả ({items.length})
          </LTTTabsTrigger>
          <LTTTabsTrigger value="now_showing">
            Đang chiếu ({items.filter((m) => m.status === "now_showing").length})
          </LTTTabsTrigger>
          <LTTTabsTrigger value="coming_soon">
            Sắp chiếu ({items.filter((m) => m.status === "coming_soon").length})
          </LTTTabsTrigger>
          <LTTTabsTrigger value="ended">
            Đã kết thúc ({items.filter((m) => m.status === "ended").length})
          </LTTTabsTrigger>
        </LTTTabsList>
      </LTTTabs>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm phim..."
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
              <th className="px-4 py-3 text-left font-semibold">Tên phim</th>
              <th className="px-4 py-3 text-left font-semibold">Thể loại</th>
              <th className="px-4 py-3 text-left font-semibold">Thời lượng</th>
              <th className="px-4 py-3 text-left font-semibold">Phân loại</th>
              <th className="px-4 py-3 text-left font-semibold">Ngày chiếu</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Không tìm thấy phim nào phù hợp.
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
                    <Film className="h-4 w-4 text-primary-shadcn shrink-0" />
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-xs">{item.genre}</td>
                  <td className="px-4 py-3 text-xs">{item.duration} phút</td>
                  <td className="px-4 py-3">
                    <LTTBadge className="bg-accent-shadcn text-accent-shadcn-foreground border-red-200">
                      {item.ageRating}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3 text-xs">{item.releaseDate}</td>
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
                          toast.success("Đã xóa phim " + item.title);
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
              {editing ? "Chỉnh sửa phim" : "Thêm phim mới"}
            </LTTDialogTitle>
          </LTTDialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <LTTLabel>Tên phim *</LTTLabel>
              <LTTInput
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Thể loại</LTTLabel>
              <LTTInput
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Thời lượng (phút)</LTTLabel>
              <LTTInput
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Phân loại tuổi</LTTLabel>
              <LTTSelect
                value={form.ageRating}
                onValueChange={(v) => setForm({ ...form, ageRating: v })}
              >
                <LTTSelectTrigger>
                  <LTTSelectValue />
                </LTTSelectTrigger>
                <LTTSelectContent>
                  <LTTSelectItem value="P">P - Mọi lứa tuổi</LTTSelectItem>
                  <LTTSelectItem value="T13">T13 - Trên 13 tuổi</LTTSelectItem>
                  <LTTSelectItem value="T16">T16 - Trên 16 tuổi</LTTSelectItem>
                  <LTTSelectItem value="T18">T18 - Trên 18 tuổi</LTTSelectItem>
                  <LTTSelectItem value="C">C - Cấm chiếu</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
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
                  <LTTSelectItem value="coming_soon">Sắp chiếu</LTTSelectItem>
                  <LTTSelectItem value="now_showing">Đang chiếu</LTTSelectItem>
                  <LTTSelectItem value="ended">Đã kết thúc</LTTSelectItem>
                </LTTSelectContent>
              </LTTSelect>
            </div>
            <div className="space-y-2">
              <LTTLabel>Đạo diễn</LTTLabel>
              <LTTInput
                value={form.director}
                onChange={(e) => setForm({ ...form, director: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Diễn viên</LTTLabel>
              <LTTInput
                value={form.cast}
                onChange={(e) => setForm({ ...form, cast: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <LTTLabel>Ngày khởi chiếu</LTTLabel>
              <LTTInput
                type="date"
                value={form.releaseDate}
                onChange={(e) =>
                  setForm({ ...form, releaseDate: e.target.value })
                }
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
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </LTTButton>
            <LTTButton onClick={save}>
              {editing ? "Lưu thay đổi" : "Tạo mới phim"}
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      <LTTDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa phim</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground-shadcn">
              Bạn có chắc chắn muốn xóa <strong>{selected.size}</strong> bộ phim đã
              chọn? Các dữ liệu suất chiếu liên quan có thể bị ảnh hưởng.
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
