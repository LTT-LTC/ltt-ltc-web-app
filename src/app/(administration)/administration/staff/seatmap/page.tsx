"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  Eye,
  Footprints,
  AlertTriangle,
  DoorOpen,
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
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";

import {
  Screen,
  SeatType,
  mockScreens,
  mockSeatTypes,
  mockAdminCinemas,
  type SeatLayoutSeat,
} from "@/src/@core/const/mock/adminMockData";
import LTTScreenCreateWizard from "@/src/@core/component/LTTManager/LTTScreenCreateWizard";

const SEAT_TYPE_COLORS: Record<number, string> = {
  1: "bg-blue-500",
  2: "bg-amber-500",
  3: "bg-pink-500",
  4: "bg-purple-500",
  5: "bg-green-500",
};

type CellType = "seat" | "empty" | "walkway" | "emergency_exit" | "door";

function getCellType(seat: SeatLayoutSeat): CellType {
  return (seat.type ?? "seat") as CellType;
}

export default function SeatMapPage() {
  const [screens, setScreens] = useState<Screen[]>(mockScreens);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [viewLayout, setViewLayout] = useState<Screen | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery) return screens;
    const q = searchQuery.toLowerCase();
    return screens.filter((s) => {
      const cinemaName = mockAdminCinemas.find((c) => c.id === s.cinemaId)?.name ?? s.cinemaId;
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
    setWizardOpen(false);
    toast.success("Tạo phòng chiếu thành công!");
  };

  const getCinemaName = (id: string) =>
    mockAdminCinemas.find((c) => c.id === id)?.name || id;

  const renderSeatCell = (seat: SeatLayoutSeat) => {
    const cellType = getCellType(seat);

    if (cellType === "walkway") {
      return (
        <Footprints className="h-3 w-3 text-muted-foreground-shadcn" />
      );
    }
    if (cellType === "emergency_exit") {
      return (
        <AlertTriangle className="h-3 w-3 text-orange-500" />
      );
    }
    if (cellType === "door") {
      return <DoorOpen className="h-3 w-3 text-green-600" />;
    }
    if (cellType === "empty") {
      return null;
    }

    // Seat (default)
    return (
      <span className="text-[9px] font-medium text-primary">
        {seat.seatCode.slice(1)}
      </span>
    );
  };

  const getCellBg = (seat: SeatLayoutSeat) => {
    const cellType = getCellType(seat);
    if (cellType === "seat") {
      // Match the source "View Layout" styling: all seats share the same background
      return "bg-primary/20 text-primary";
    }
    if (cellType === "empty")
      return "bg-muted-shadcn/50 border border-dashed border-border-shadcn";
    if (cellType === "walkway") return "bg-muted-shadcn";
    if (cellType === "emergency_exit") return "bg-orange-100";
    if (cellType === "door") return "bg-green-100";
    return "bg-muted-shadcn";
  };

  const totalSeatsInLayout = (layout: Screen) =>
    layout.seatLayout.rows.reduce((sum, row) => {
      return (
        sum +
        row.seats.filter((s) => {
          const t = getCellType(s);
          // `seat_continuation` is stored as a "seat" without a seatCode,
          // so we only count origin seats (non-empty seatCode).
          return t === "seat" && Boolean(s.seatCode && s.seatCode.trim());
        }).length
      );
    }, 0);

  const renderViewLegend = (seatTypes: SeatType[]) => (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-border-shadcn bg-muted-shadcn/20 px-6 py-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-muted-shadcn/50 border border-dashed border-border-shadcn" />
        <span className="text-muted-foreground-shadcn">Trống</span>
      </div>
      <div className="flex items-center gap-2">
        <Footprints className="h-3 w-3 text-muted-foreground-shadcn" />
        <span className="text-muted-foreground-shadcn">Lối đi</span>
      </div>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-3 w-3 text-orange-500" />
        <span className="text-muted-foreground-shadcn">Thoát hiểm</span>
      </div>
      <div className="flex items-center gap-2">
        <DoorOpen className="h-3 w-3 text-green-600" />
        <span className="text-muted-foreground-shadcn">Cửa</span>
      </div>

      <div className="h-4 w-px bg-border-shadcn mx-2" />

      {seatTypes.map((st) => (
        <div key={st.id} className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-sm ${SEAT_TYPE_COLORS[st.id] || "bg-blue-500"}`} />
          <span className="text-muted-foreground-shadcn">{st.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Quản lý phòng chiếu</h1>
        <LTTButton onClick={() => setWizardOpen(true)} className="gap-2">
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
                  <td className="px-4 py-3">
                    Phòng {item.screenNumber}
                  </td>
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
                        onClick={() => setViewLayout(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </LTTButton>
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
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

      {/* Bulk Delete */}
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

      {/* View Layout */}
      <LTTDialog
        open={!!viewLayout}
        onOpenChange={() => setViewLayout(null)}
      >
        <LTTDialogContent className="sm:max-w-2xl">
          <LTTDialogHeader>
            <LTTDialogTitle>
              Sơ đồ ghế - Phòng {viewLayout?.screenNumber} ({viewLayout?.screenType})
            </LTTDialogTitle>
          </LTTDialogHeader>

          {viewLayout && (
            <div className="space-y-4">
              <div className="mx-auto w-48 h-2 rounded-full bg-primary-shadcn mb-6 shadow-sm shadow-primary-shadcn/20" />
              <p className="text-center text-xs text-muted-foreground mb-1">
                MÀN HÌNH
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Tổng ghế: <strong>{totalSeatsInLayout(viewLayout)}</strong>
              </p>

              <div className="flex flex-col items-center gap-1">
                {viewLayout.seatLayout.rows.map((row, rowIdx, allRows) => {
                  const isTopOrBottom = rowIdx === 0 || rowIdx === allRows.length - 1;
                  const isInternalRow = !isTopOrBottom && row.seats.length >= 3;
                  const leftBorder = isInternalRow ? row.seats[0] : null;
                  const rightBorder = isInternalRow ? row.seats[row.seats.length - 1] : null;
                  const innerSeats = isInternalRow ? row.seats.slice(1, row.seats.length - 1) : row.seats;

                  const innerIsWalkwayRow =
                    isInternalRow && innerSeats.length > 0
                      ? innerSeats.every((s) => getCellType(s) === "walkway")
                      : false;

                  const rowLabel = isInternalRow ? (innerIsWalkwayRow ? "—" : row.row) : row.row;

                  return (
                    <div
                      key={rowLabel || `row-${rowIdx}`}
                      className="flex items-center gap-1"
                    >
                      {!isTopOrBottom && leftBorder ? (
                        <div
                          key={`left-${rowIdx}`}
                          className={[
                            "h-6 w-6 rounded flex items-center justify-center",
                            getCellBg(leftBorder),
                          ].join(" ")}
                          title={leftBorder.seatCode}
                        >
                          {renderSeatCell(leftBorder)}
                        </div>
                      ) : null}

                      <span className="w-6 text-xs font-medium text-muted-foreground-shadcn">
                        {rowLabel}
                      </span>

                      {innerSeats.map((seat, seatIdx) => {
                        const cellType = getCellType(seat);
                        return (
                          <div
                            key={seat.seatCode || `${rowIdx}-${seatIdx}`}
                            className={[
                              "h-6 w-6 rounded flex items-center justify-center",
                              getCellBg(seat),
                            ].join(" ")}
                            title={seat.seatCode}
                          >
                            {renderSeatCell(seat)}
                            {cellType === "seat" && (
                              <span className="sr-only">{seat.seatCode}</span>
                            )}
                          </div>
                        );
                      })}

                      {!isTopOrBottom && rightBorder ? (
                        <div
                          key={`right-${rowIdx}`}
                          className={[
                            "h-6 w-6 rounded flex items-center justify-center",
                            getCellBg(rightBorder),
                          ].join(" ")}
                          title={rightBorder.seatCode}
                        >
                          {renderSeatCell(rightBorder)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {renderViewLegend(mockSeatTypes)}
            </div>
          )}
        </LTTDialogContent>
      </LTTDialog>

      {/* Create Wizard */}
      {wizardOpen && (
        <LTTScreenCreateWizard
          onClose={() => setWizardOpen(false)}
          onCreated={handleScreenCreated}
        />
      )}
    </div>
  );
}

