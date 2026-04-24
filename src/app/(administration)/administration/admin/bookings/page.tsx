"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Filter, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
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
import { bookingService, PaymentOutputDto } from "@/src/services/administration-service/booking/booking.service";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { cn } from "@/src/@core/utils/cn";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

export default function BookingManagementPage() {
  const [items, setItems] = useState<PaymentOutputDto[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const listMutation = useLTTMutation<PagedResultDto<PaymentOutputDto> | undefined, any>({
    mutationFn: (params) => bookingService.getBookingListAsync(params),
    onSuccess: (res) => { if (res && res.items) setItems(res.items); },
    onError: (err) => toast.error(err.message || "Lỗi tải lịch sử đặt vé")
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

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Quản lý đặt vé & Thanh toán</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder="Tìm theo tên khách hàng, mã giao dịch..."
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
            <LTTSelectItem value="all">Tất cả trạng thái</LTTSelectItem>
            <LTTSelectItem value="success">Thành công</LTTSelectItem>
            <LTTSelectItem value="pending">Chờ thanh toán</LTTSelectItem>
            <LTTSelectItem value="failed">Thất bại</LTTSelectItem>
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
              <th className="px-4 py-3 text-left font-semibold">Mã giao dịch</th>
              <th className="px-4 py-3 text-left font-semibold">Khách hàng</th>
              <th className="px-4 py-3 text-left font-semibold">Số tiền</th>
              <th className="px-4 py-3 text-left font-semibold">Phương thức</th>
              <th className="px-4 py-3 text-left font-semibold">Thời gian</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {listMutation.isLoading ? (
              <DomainTableStateRow colSpan={7} state="loading" loadingText="Đang tải lịch sử đặt vé..." />
            ) : items.length === 0 ? (
              <DomainTableStateRow colSpan={7} state="empty" emptyText="Không tìm thấy lịch sử giao dịch." />
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 font-medium">{item.customerName}</td>
                  <td className="px-4 py-3 font-semibold">{formatVND(item.amount)}</td>
                  <td className="px-4 py-3 text-xs opacity-70">{item.paymentMethod}</td>
                  <td className="px-4 py-3 text-xs">{item.createdAt}</td>
                  <td className="px-4 py-3">
                    <LTTBadge
                      className={cn(
                        "font-medium",
                        item.status === "success" ? "bg-green-100 text-green-700 border-green-200" :
                          item.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200" :
                            "bg-red-100 text-red-700 border-red-200"
                      )}
                    >
                      {item.status}
                    </LTTBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <LTTButton variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </LTTButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
