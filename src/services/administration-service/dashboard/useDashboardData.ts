import { useCallback, useEffect, useState } from "react";
import {
    dashboardService,
    type DashboardSummaryOutputDto,
    type HallOccupancyOutputDto,
    type PromotionSummaryOutputDto,
} from "./dashboard.service";

export interface DashboardData {
    loading: boolean;
    error: string | null;
    summary: DashboardSummaryOutputDto | null;
    hallOccupancy: HallOccupancyOutputDto | null;
    promotionSummary: PromotionSummaryOutputDto | null;
    reload: () => void;
}

export function useDashboardData(params: {
    fromDate: string;
    toDate: string;
    cinemaId?: string;
}): DashboardData {
    const { fromDate, toDate, cinemaId } = params;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<DashboardSummaryOutputDto | null>(null);
    const [hallOccupancy, setHallOccupancy] = useState<HallOccupancyOutputDto | null>(null);
    const [promotionSummary, setPromotionSummary] = useState<PromotionSummaryOutputDto | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        const filter = { fromDate, toDate, cinemaId };

        try {
            const [summaryRes, occupancyRes, promoRes] = await Promise.allSettled([
                dashboardService.getDashboardSummaryAsync(filter),
                dashboardService.getHallOccupancyAsync(filter),
                dashboardService.getPromotionSummaryAsync(),
            ]);

            if (summaryRes.status === "fulfilled") setSummary(summaryRes.value);
            else console.warn("Dashboard summary failed:", summaryRes.reason);

            if (occupancyRes.status === "fulfilled") setHallOccupancy(occupancyRes.value);
            else console.warn("Hall occupancy failed:", occupancyRes.reason);

            if (promoRes.status === "fulfilled") setPromotionSummary(promoRes.value);
            else console.warn("Promotion summary failed:", promoRes.reason);

            const allFailed =
                summaryRes.status === "rejected" &&
                occupancyRes.status === "rejected" &&
                promoRes.status === "rejected";
            if (allFailed) setError("Failed to load dashboard data");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, cinemaId]);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        loading,
        error,
        summary,
        hallOccupancy,
        promotionSummary,
        reload: load,
    };
}
