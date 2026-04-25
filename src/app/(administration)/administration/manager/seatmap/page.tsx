"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  Eye,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTCheckbox } from "@/src/@core/component/LTTShadcnUI/LTTCheckbox";
import { LTTDialog } from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import {
  LTTDialogContent,
  LTTDialogHeader,
  LTTDialogTitle,
  LTTDialogFooter,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";

import {
  type Screen,
  mockScreens,
  mockAdminCinemas,
} from "@/src/@core/const/mock/adminMockData";
import LTTScreenCreateWizard from "@/src/@core/component/LTTManager/LTTScreenCreateWizard";
import LTTSeatMapViewer from "@/src/@core/component/LTTManager/LTTSeatMapViewer";


export default function SeatMapPage() {
  const [screens, setScreens] = useState<Screen[]>(mockScreens);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewLayout, setViewLayout] = useState<Screen | null>(null);

  // Master-detail view state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery) return screens;
    const q = searchQuery.toLowerCase();
    return screens.filter((s) => {
      const cinemaName =
        mockAdminCinemas.find((c) => c.id === s.cinemaId)?.name ?? s.cinemaId;
      return (
        s.screenType.toLowerCase().includes(q) ||
        String(s.screenNumber).includes(q) ||
        cinemaName.toLowerCase().includes(q)
      );
    });
  }, [screens, searchQuery]);

  const allSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleDeleteSelected = () => {
    setScreens((prev) => prev.filter((s) => !selected.has(s.id)));
    toast.success(`Đã xóa ${selected.size} phòng chiếu`);
    setSelected(new Set());
    setDeleteDialogOpen(false);
  };

  const handleDeleteOne = (id: string) => {
    setScreens((prev) => prev.filter((s) => s.id !== id));
    selected.delete(id);
    setSelected(new Set(selected));
    toast.success("Đã xóa phòng chiếu");
  };

  const handleScreenCreated = (screen: Screen) => {
    setScreens((prev) => [...prev, screen]);
    setIsEditorOpen(false);
    setEditingScreen(null);
    toast.success("Tạo phòng chiếu thành công!");
  };

  const handleScreenUpdated = (screen: Screen) => {
    setScreens((prev) => prev.map((s) => (s.id === screen.id ? screen : s)));
    setIsEditorOpen(false);
    setEditingScreen(null);
    toast.success("Cập nhật phòng chiếu thành công!");
  };

  const handleOpenEditor = (screen?: Screen) => {
    setEditingScreen(screen ?? null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingScreen(null);
  };

  const getCinemaName = (id: string) =>
    mockAdminCinemas.find((c) => c.id === id)?.name || id;

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Quản lý phòng chiếu</h1>
        <LTTButton onClick={() => handleOpenEditor()} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm phòng chiếu
        </LTTButton>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm kiếm phòng chiếu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {selected.size > 0 && (
          <LTTButton
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Xóa {selected.size} mục
          </LTTButton>
        )}
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="w-10 px-3 py-3">
                <LTTCheckbox checked={allSelected} onCheckedChange={toggleAll} />
              </th>
              <th className="px-4 py-3 text-left font-semibold">STT</th>
              <th className="px-4 py-3 text-left font-semibold">Rạp</th>
              <th className="px-4 py-3 text-left font-semibold">Phòng số</th>
              <th className="px-4 py-3 text-left font-semibold">Loại phòng</th>
              <th className="px-4 py-3 text-left font-semibold">Số ghế</th>
              <th className="px-4 py-3 text-left font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-muted-foreground-shadcn"
                >
                  Không có dữ liệu
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
                      onCheckedChange={() => toggleOne(item.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {getCinemaName(item.cinemaId)}
                  </td>
                  <td className="px-4 py-3">Phòng {item.screenNumber}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-accent-shadcn px-2.5 py-0.5 text-xs font-medium text-accent-shadcn-foreground">
                      {item.screenType}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.seatCount}</td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {item.createdAt}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn text-xs">
                    {item.updatedAt}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Xem sơ đồ"
                        onClick={() => setViewLayout(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Chỉnh sửa"
                        onClick={() => handleOpenEditor(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Xóa"
                        onClick={() => handleDeleteOne(item.id)}
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

      {/* Bulk Delete Dialog */}
      <LTTDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Xác nhận xóa</LTTDialogTitle>
          </LTTDialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa{" "}
            <strong>{selected.size}</strong> phòng chiếu? Hành động này không thể
            hoàn tác.
          </p>
          <LTTDialogFooter>
            <LTTButton
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </LTTButton>
            <LTTButton variant="destructive" onClick={handleDeleteSelected}>
              Xóa
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>

      {/* View Layout Dialog */}
      <LTTDialog
        open={!!viewLayout}
        onOpenChange={() => setViewLayout(null)}
      >
        <LTTDialogContent className="sm:max-w-3xl">
          <LTTDialogHeader>
            <LTTDialogTitle>
              Sơ đồ ghế — Phòng {viewLayout?.screenNumber} ({viewLayout?.screenType})
            </LTTDialogTitle>
          </LTTDialogHeader>

          {viewLayout && (
            <div className="space-y-6 py-2 overflow-y-auto max-h-[75vh]">
              <LTTSeatMapViewer
                seatLayout={viewLayout.seatLayout}
                readOnly
                showScreen
                showLegend
              />
              <p className="text-center text-xs text-muted-foreground">
                Tổng ghế: <strong>{viewLayout.seatCount}</strong>
              </p>
            </div>
          )}
        </LTTDialogContent>
      </LTTDialog>
    </div>
    
    {isEditorOpen && (
      <LTTScreenCreateWizard
        key={editingScreen?.id ?? "new"}
        onClose={handleCloseEditor}
        onCreated={handleScreenCreated}
        onUpdate={handleScreenUpdated}
        initialData={editingScreen ?? undefined}
      />
    )}
  </>
  );
}
