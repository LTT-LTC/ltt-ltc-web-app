"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, RefreshCw } from "lucide-react";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import { toast } from "sonner";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import useDebouncedListQuery from "@/src/@core/hooks/useDebouncedListQuery";
import { managerSeatTypeService as seatTypeService } from "@/src/services/administration-service/manager/seat-type/seat-type.service";
import { SeatTypeOutputDto } from "@/src/services/administration-service/seat-type/models/output.model";
import { GetSeatTypeListInputDto } from "@/src/services/administration-service/seat-type/models/input.model";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { useLocalization } from "@/src/@core/hooks/use-localization";
import DomainTableStateRow from "@/src/app/(administration)/administration/_components/DomainTableStateRow";

export default function SeatTypesManagerPage() {
  const { t } = useLocalization();
  const [items, setItems] = useState<SeatTypeOutputDto[]>([]);
  const [search, setSearch] = useState("");

  const listMutation = useLTTMutation<PagedResultDto<SeatTypeOutputDto> | undefined, GetSeatTypeListInputDto>({
    mutationFn: (input) => seatTypeService.getSeatTypeListAsync(input),
    onSuccess: (res) => {
      if (res && res.items) setItems(res.items);
    },
    onError: (err) => toast.error(err.message || t("admin.seat_type.fetch_error"))
  });

  const loading = listMutation.isLoading;

  const fetchData = (keyword?: string) => {
    const effectiveKeyword = keyword ?? debouncedSearch;
    listMutation.mutation({ page: 1, fetch: 100, keyword: effectiveKeyword });
  };

  const debouncedSearch = useDebouncedListQuery(search, (keyword) => fetchData(keyword));

  useEffect(() => {
    fetchData("");
  }, []);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((c) => c.name.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.seat_type.title")}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
          <LTTInput
            placeholder={t("admin.seat_type.search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <LTTButton
          variant="outline"
          className="gap-2"
          onClick={() => fetchData()}
          loading={listMutation.isLoading}
        >
          <RefreshCw className="h-4 w-4" /> {t("admin.seat_type.refresh")}
        </LTTButton>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card overflow-hidden shadow-sm my-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-shadcn bg-muted-shadcn/50">
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seat_type.table.name")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seat_type.table.description")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seat_type.table.number_of_seat")}</th>
              <th className="px-4 py-3 text-left font-semibold">{t("admin.seat_type.table.price_multiplier")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <DomainTableStateRow colSpan={4} state="loading" loadingText={t("admin.common.loading")} />
            ) : filtered.length === 0 ? (
              <DomainTableStateRow colSpan={4} state="empty" emptyText={t("admin.seat_type.empty")} />
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border-shadcn last:border-0 hover:bg-muted-shadcn/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground-shadcn">{item.description}</td>
                  <td className="px-4 py-3">{item.numberOfSeat}</td>
                  <td className="px-4 py-3 font-semibold text-brand-600">x{item.priceMultiplier}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
