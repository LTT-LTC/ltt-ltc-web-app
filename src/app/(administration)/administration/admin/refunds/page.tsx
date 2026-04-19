"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle2, XCircle, Eye, Clock, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
  LTTSelect,
  LTTSelectContent,
  LTTSelectItem,
  LTTSelectTrigger,
  LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import {
  LTTDialog,
  LTTDialogContent,
  LTTDialogHeader,
  LTTDialogTitle,
  LTTDialogFooter,
} from "@/src/@core/component/LTTShadcnUI/LTTDialog";
import { LTTTextarea } from "@/src/@core/component/LTTShadcnUI/LTTTextarea";
import { LTTLabel } from "@/src/@core/component/LTTShadcnUI/LTTLabel";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { refundService } from "@/src/services/administration-service/refund/refund.service";
import { RefundOutputDto } from "@/src/services/administration-service/masterdata/models/refund.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { useEffect } from "react";
import { cn } from "@/src/@core/utils/cn";

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};
const statusLabel: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
};
const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function RefundApprovalPage() {
  const [items, setItems] = useState<RefundOutputDto[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewItem, setViewItem] = useState<RefundOutputDto | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const listMutation = useLTTMutation<PagedResultDto<RefundOutputDto> | undefined, any>({
    mutationFn: (params) => refundService.getRefundListAsync(params),
    onSuccess: (res) => { if (res && res.items) setItems(res.items); },
    onError: (err) => toast.error(err.message || "Lỗi tải danh sách hoàn tiền")
  });

  const approveMutation = useLTTMutation<void, string>({
    mutationFn: (id) => refundService.approveRefundAsync(id),
    onSuccess: () => { toast.success("Đã duyệt hoàn tiền"); fetchData(); },
    onError: (err) => toast.error(err.message || "Lỗi")
  });

  const rejectMutation = useLTTMutation<void, { id: string; reason: string }>({
    mutationFn: (data) => refundService.rejectRefundAsync(data.id, data.reason),
    onSuccess: () => {
      toast.success("Đã từ chối hoàn tiền");
      setRejectOpen(false);
      setRejectReason("");
      fetchData();
    },
    onError: (err) => toast.error(err.message || "Lỗi")
  });

  const fetchData = () => {
    listMutation.mutation({
      page: 1,
      fetch: 100,
      keyword: debouncedSearch,
      status: statusFilter === "all" ? undefined : statusFilter
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, statusFilter]);

  const filtered = items;

  const handleApprove = (id: string) => {
    approveMutation.mutation(id);
    if (viewItem?.id === id) setViewItem(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }
    rejectMutation.mutation({ id: rejectId, reason: rejectReason });
    if (viewItem?.id === rejectId) setViewItem(null);
  };

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const totalPendingAmount = items
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Duyệt hoàn tiền</h1>
        <div className="flex items-center gap-2 rounded-lg border border-border-shadcn bg-card px-4 py-2 shadow-sm">
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="text-sm">
            <strong>{pendingCount}</strong> yêu cầu chờ duyệt
          </span>
          <span className="text-sm text-muted-foreground-shadcn">
            — Tổng: <strong>{formatVND(totalPendingAmount)}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm theo mã, khách hàng, phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <LTTSelect value={statusFilter} onValueChange={setStatusFilter}>
          <LTTSelectTrigger className="w-44">
            <LTTSelectValue placeholder="Trạng thái" />
          </LTTSelectTrigger>
          <LTTSelectContent>
            <LTTSelectItem value="all">Tất cả</LTTSelectItem>
            {Object.entries(statusLabel).map(([k, v]) => (
              <LTTSelectItem key={k} value={k}>
                {v}
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
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="px-4 py-3 text-left font-semibold">Mã</th>
              <th className="px-4 py-3 text-left font-semibold">Khách hàng</th>
              <th className="px-4 py-3 text-left font-semibold">Phim</th>
              <th className="px-4 py-3 text-left font-semibold">Rạp</th>
              <th className="px-4 py-3 text-left font-semibold">Ngày chiếu</th>
              <th className="px-4 py-3 text-right font-semibold">Số tiền</th>
              <th className="px-4 py-3 text-left font-semibold">Lý do</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground-shadcn">
                  Không có yêu cầu hoàn tiền nào.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 font-medium">{item.customerName}</td>
                  <td className="px-4 py-3 text-xs">{item.movieTitle}</td>
                  <td className="px-4 py-3 text-xs">{item.cinemaName}</td>
                  <td className="px-4 py-3 text-xs">
                    {item.showDate} {item.showTime}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatVND(item.amount)}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-muted-foreground-shadcn text-xs">
                    {item.reason}
                  </td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={cn("font-medium", statusColor[item.status])}
                    >
                      {statusLabel[item.status]}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <LTTButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewItem(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </LTTButton>
                      {item.status === "pending" && (
                        <>
                          <LTTButton
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(item.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </LTTButton>
                          <LTTButton
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setRejectId(item.id);
                              setRejectOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </LTTButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Detail */}
      <LTTDialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <LTTDialogContent className="sm:max-w-lg">
          <LTTDialogHeader>
            <LTTDialogTitle>Chi tiết hoàn tiền #{viewItem?.id}</LTTDialogTitle>
          </LTTDialogHeader>
          {viewItem && (
            <div className="space-y-4 text-sm pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground-shadcn">
                    Khách hàng:
                  </span>{" "}
                  <strong>{viewItem.customerName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground-shadcn">Email:</span>{" "}
                  {viewItem.customerEmail}
                </div>
                <div className="col-span-2 border-t border-border-shadcn pt-2 mt-2">
                  <span className="text-muted-foreground-shadcn">Phim:</span>{" "}
                  <strong>{viewItem.movieTitle}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground-shadcn">Rạp:</span>{" "}
                  {viewItem.cinemaName}
                </div>
                <div>
                  <span className="text-muted-foreground-shadcn">
                    Ngày chiếu:
                  </span>{" "}
                  {viewItem.showDate} {viewItem.showTime}
                </div>
                <div>
                  <span className="text-muted-foreground-shadcn">Số vé:</span>{" "}
                  {viewItem.ticketCount}
                </div>
              </div>
              <div className="rounded-lg bg-muted-shadcn/50 p-3 border border-border-shadcn">
                <p className="text-muted-foreground-shadcn mb-1 font-medium">
                  Lý do yêu cầu:
                </p>
                <p>{viewItem.reason}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border-shadcn pt-4 mt-2">
                <span className="text-xl font-bold text-primary-shadcn">
                  {formatVND(viewItem.amount)}
                </span>
                {viewItem.status === "pending" && (
                  <div className="flex gap-2">
                    <LTTButton
                      variant="outline"
                      onClick={() => {
                        setRejectId(viewItem.id);
                        setRejectOpen(true);
                        setViewItem(null);
                      }}
                      className="gap-2 text-destructive border-red-200"
                    >
                      <XCircle className="h-4 w-4" /> Từ chối
                    </LTTButton>
                    <LTTButton
                      onClick={() => handleApprove(viewItem.id)}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Duyệt hoàn tiền
                    </LTTButton>
                  </div>
                )}
              </div>
              {viewItem.processedAt && (
                <p className="text-xs text-muted-foreground-shadcn italic text-right">
                  Xử lý bởi {viewItem.processedBy} lúc {viewItem.processedAt}
                </p>
              )}
            </div>
          )}
        </LTTDialogContent>
      </LTTDialog>

      {/* Reject Dialog */}
      <LTTDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <LTTDialogContent className="sm:max-w-sm">
          <LTTDialogHeader>
            <LTTDialogTitle>Từ chối hoàn tiền</LTTDialogTitle>
          </LTTDialogHeader>
          <div className="space-y-2 py-4">
            <LTTLabel>Lý do từ chối</LTTLabel>
            <LTTTextarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do thực tế tại sao yêu cầu bị từ chối..."
            />
          </div>
          <LTTDialogFooter>
            <LTTButton variant="outline" onClick={() => setRejectOpen(false)}>
              Hủy
            </LTTButton>
            <LTTButton variant="destructive" onClick={handleReject}>
              Xác nhận từ chối
            </LTTButton>
          </LTTDialogFooter>
        </LTTDialogContent>
      </LTTDialog>
    </div>
  );
}
