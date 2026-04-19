"use client";

import { useState, useEffect } from "react";
import { Plus, Gift, Tag, Search, Trash2, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
  LTTTabs,
  LTTTabsContent,
  LTTTabsList,
  LTTTabsTrigger
} from "@/src/@core/component/LTTShadcnUI/LTTTabs";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { giftCodeService } from "@/src/services/administration-service/gift-code/gift-code.service";
import { GiftCodeOutputDto } from "@/src/services/administration-service/gift-code/models/output.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { cn } from "@/src/@core/utils/cn";

export default function PromotionsListPage() {
  const [items, setItems] = useState<GiftCodeOutputDto[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("promotions");

  const listMutation = useLTTMutation<PagedResultDto<GiftCodeOutputDto> | undefined, any>({
    mutationFn: (params) => giftCodeService.getList(params),
    onSuccess: (res) => { if (res && res.items) setItems(res.items); },
    onError: (err) => toast.error(err.message || "Lỗi tải danh sách")
  });

  const fetchData = () => {
    listMutation.mutation({ page: 1, fetch: 100, keyword: debouncedSearch });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Khuyến mãi & Gift Card</h1>
        <div className="flex gap-2">
          <LTTButton variant="outline" className="gap-2">
            <Tag className="h-4 w-4" /> Tạo mã giảm giá
          </LTTButton>
          <LTTButton className="gap-2">
            <Plus className="h-4 w-4" /> Tạo Gift Card
          </LTTButton>
        </div>
      </div>

      <LTTTabs value={activeTab} onValueChange={setActiveTab}>
        <LTTTabsList className="bg-muted-shadcn/50">
          <LTTTabsTrigger value="promotions">Mã khuyến mãi</LTTTabsTrigger>
          <LTTTabsTrigger value="giftcards">Gift Cards</LTTTabsTrigger>
        </LTTTabsList>

        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
            <LTTInput
              placeholder="Tìm kiếm mã..."
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
        </div>

        <div className="mt-4 rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
                <th className="px-4 py-3 text-left font-semibold">Mã</th>
                <th className="px-4 py-3 text-left font-semibold">Mô tả</th>
                <th className="px-4 py-3 text-right font-semibold">Giảm giá</th>
                <th className="px-4 py-3 text-left font-semibold">Hiệu lực</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground-shadcn">
                    {listMutation.isLoading ? "Đang tải..." : "Chưa có dữ liệu."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-border-shadcn hover:bg-muted-shadcn/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary-shadcn">{item.code}</td>
                    <td className="px-4 py-3 text-xs">{item.description || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {item.discountType === "Fixed" ? `${item.discountValue.toLocaleString()}đ` : `${item.discountValue}%`}
                    </td>
                    <td className="px-4 py-3 text-[10px]">
                      {item.startDate?.split("T")[0]} → {item.endDate?.split("T")[0]}
                    </td>
                    <td className="px-4 py-3">
                      <LTTBadge className={cn("text-[10px]", item.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {item.status}
                      </LTTBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <LTTButton variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </LTTButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </LTTTabs>
    </div>
  );
}

