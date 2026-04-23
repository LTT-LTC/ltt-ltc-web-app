"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { toast } from "sonner";
import { managerPromotionGiftcardService } from "@/src/services/administration-service/manager/promotion-giftcard/promotion-giftcard.service";
import { NewsAndOffersOutputDto } from "@/src/services/administration-service/news-and-offers/models/output.model";

export default function PromotionsPage() {
  const { t } = useLocalization();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<NewsAndOffersOutputDto[]>([]);

  const listMutation = useLTTMutation({
    mutationFn: () =>
      managerPromotionGiftcardService.getPromotionListAsync({
        page: 1,
        fetch: 50,
        keyword: search,
      }),
    onSuccess: (res) => setItems(res?.items ?? []),
    onError: (err) => toast.error(err.message || t("admin.common.error.generic")),
  });

  useEffect(() => {
    listMutation.mutation();
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.promotions.title")}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.promotions.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions.table.title")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions.table.start_date")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions.table.end_date")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.promotions.table.status")}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground-shadcn">
                  {listMutation.isLoading ? t("admin.common.loading") : t("admin.promotions.empty")}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border-shadcn last:border-0">
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">{item.startDate ? new Date(item.startDate).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">{item.endDate ? new Date(item.endDate).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">{item.isActive ? t("admin.common.active") : t("admin.common.inactive")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
