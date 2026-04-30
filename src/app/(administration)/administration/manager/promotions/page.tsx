"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { managerPromotionGiftcardService } from "@/src/services/administration-service/manager/promotion-giftcard/promotion-giftcard.service";
import { NewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";
import { GiftCodeOutputDto } from "@/src/services/administration-service/gift-code/models/output.model";
import AdminTablePagination from "@/src/app/(administration)/administration/admin/_components/AdminTablePagination";
import { LTTBadge } from "@/src/@core/component/LTTShadcnUI/LTTBadge";
import { cn } from "@/src/@core/utils/cn";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

export default function PromotionsPage() {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<"promotions" | "giftcards">("promotions");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [promotionItems, setPromotionItems] = useState<NewsAndOffersOutputDto[]>([]);
  const [giftcardItems, setGiftcardItems] = useState<GiftCodeOutputDto[]>([]);
  const [page, setPage] = useState(1);
  const [fetch, setFetch] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const promotionsMutation = useLTTMutation({
    mutationFn: () =>
      managerPromotionGiftcardService.getPromotionListAsync({
        page,
        fetch,
        keyword: debouncedSearch,
      }),
    onSuccess: (res) => {
      setPromotionItems(res?.items ?? []);
      setTotalCount(res?.totalCount ?? 0);
    },
    onError: (err) => toast.error(err.message || t("admin.promotions_giftcard.fetch_error")),
  });

  const giftcardsMutation = useLTTMutation({
    mutationFn: () =>
      managerPromotionGiftcardService.getGiftCardListAsync({
        page,
        fetch,
        keyword: debouncedSearch,
      }),
    onSuccess: (res) => {
      setGiftcardItems(res?.items ?? []);
      setTotalCount(res?.totalCount ?? 0);
    },
    onError: (err) => toast.error(err.message || t("admin.promotions_giftcard.fetch_error")),
  });

  const isLoading = promotionsMutation.isLoading || giftcardsMutation.isLoading;

  const fetchData = () => {
    if (activeTab === "promotions") {
      promotionsMutation.mutation();
      return;
    }
    giftcardsMutation.mutation();
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, activeTab, page, fetch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.promotions_giftcard.title")}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.promotions_giftcard.search_placeholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <LTTButton variant="outline" className="gap-2" onClick={fetchData} loading={isLoading}>
          <RefreshCw className="h-4 w-4" /> {t("admin.promotions_giftcard.refresh")}
        </LTTButton>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
        <div className="flex border-b border-border-shadcn bg-muted-shadcn/50 px-4 pt-3">
          <button
            type="button"
            className={cn(
              "mr-4 border-b-2 px-1 pb-3 text-sm font-semibold",
              activeTab === "promotions" ? "border-primary-shadcn text-primary-shadcn" : "border-transparent text-muted-foreground-shadcn",
            )}
            onClick={() => {
              setActiveTab("promotions");
              setPage(1);
            }}
          >
            {t("admin.promotions_giftcard.tab_promotions")}
          </button>
          <button
            type="button"
            className={cn(
              "border-b-2 px-1 pb-3 text-sm font-semibold",
              activeTab === "giftcards" ? "border-primary-shadcn text-primary-shadcn" : "border-transparent text-muted-foreground-shadcn",
            )}
            onClick={() => {
              setActiveTab("giftcards");
              setPage(1);
            }}
          >
            {t("admin.promotions_giftcard.tab_giftcards")}
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="px-4 py-3 text-left font-semibold">
                {activeTab === "promotions" ? t("admin.news_and_offers.table.title") : t("admin.promotions_giftcard.table.code")}
              </th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions_giftcard.table.description")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions_giftcard.form.start_date")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions_giftcard.form.end_date")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions_giftcard.table.status")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <DomainTableStateRow colSpan={5} state="loading" loadingText={t("admin.promotions_giftcard.loading")} />
            ) : activeTab === "promotions" && promotionItems.length === 0 ? (
              <DomainTableStateRow colSpan={5} state="empty" emptyText={t("admin.promotions_giftcard.empty")} />
            ) : activeTab === "giftcards" && giftcardItems.length === 0 ? (
              <DomainTableStateRow colSpan={5} state="empty" emptyText={t("admin.promotions_giftcard.empty")} />
            ) : (
              activeTab === "promotions"
                ? promotionItems.map((item) => (
                    <tr key={item.id} className="border-b border-border-shadcn last:border-0">
                      <td className="px-4 py-3 font-medium">{item.title}</td>
                      <td className="px-4 py-3 text-xs">{item.content || "-"}</td>
                      <td className="px-4 py-3">{item.startDate ? new Date(item.startDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3">{item.endDate ? new Date(item.endDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3">
                        <LTTBadge className={item.isActive ? "bg-green-100 text-green-700" : "bg-muted-shadcn text-muted-foreground-shadcn"}>
                          {item.isActive ? t("admin.common.active") : t("admin.common.inactive")}
                        </LTTBadge>
                      </td>
                    </tr>
                  ))
                : giftcardItems.map((item) => (
                    <tr key={item.id} className="border-b border-border-shadcn last:border-0">
                      <td className="px-4 py-3 font-mono font-bold text-primary-shadcn">{item.code}</td>
                      <td className="px-4 py-3 text-xs">{item.description || "-"}</td>
                      <td className="px-4 py-3">{item.startDate ? new Date(item.startDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3">{item.endDate ? new Date(item.endDate).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3">
                        <LTTBadge className={((item.status || "").toLowerCase() === "active") ? "bg-green-100 text-green-700" : "bg-muted-shadcn text-muted-foreground-shadcn"}>
                          {item.status || "-"}
                        </LTTBadge>
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
        onPageChange={(nextPage) => setPage(nextPage)}
        onPageSizeChange={(nextSize) => {
          setFetch(nextSize);
          setPage(1);
        }}
        loading={isLoading}
      />
    </div>
  );
}
