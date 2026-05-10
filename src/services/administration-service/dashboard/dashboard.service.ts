import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { getRoleScopedRootPath } from "../administration.service";

export interface DashboardSummaryInputDto {
    fromDate: string;
    toDate: string;
    cinemaId?: string;
}

export interface DashboardTotalsDto {
    totalRevenue: number;
    ticketRevenue: number;
    fnbRevenue: number;
    ticketsSold: number;
    transactionCount: number;
}

export interface DailyRevenueDto {
    date: string;
    ticketRevenue: number;
    fnbRevenue: number;
    totalRevenue: number;
    ticketsSold: number;
}

export interface HourlyRevenueDto {
    hour: string;
    revenue: number;
    transactionCount: number;
}

export interface MovieRevenueDto {
    movieTitle: string;
    showtimeId?: string;
    revenue: number;
    ticketsSold: number;
}

export interface DashboardSummaryOutputDto {
    totals: DashboardTotalsDto;
    dailyBreakdown: DailyRevenueDto[];
    hourlyTrend: HourlyRevenueDto[];
    topMovies: MovieRevenueDto[];
}

export interface HallOccupancyItemDto {
    screenId: string;
    screenName: string;
    movieTitle?: string;
    totalSeats: number;
    soldSeats: number;
    occupancyPercent: number;
    showDate: string;
    startTime: string;
}

export interface HallOccupancyOutputDto {
    halls: HallOccupancyItemDto[];
    averageOccupancyRate: number;
}

export interface ActivePromotionDto {
    name: string;
    badge?: string;
    status: string;
    expiresAt?: string;
}

export interface GiftCardSummaryDto {
    outstandingBalance: number;
    redeemedToday: number;
    activeGiftCards: number;
}

export interface PromotionSummaryOutputDto {
    activePromotions: ActivePromotionDto[];
    giftCardSummary: GiftCardSummaryDto;
}

const getPaymentDashboardPath = (): string => {
    const rolePath = getRoleScopedRootPath();
    return rolePath.replace("/administration-service", "/payment-service") + "/payment";
};

const getAdminDashboardPath = (): string => {
    return `${getRoleScopedRootPath()}/dashboard`;
};

const getDashboardSummaryAsync = async (params: DashboardSummaryInputDto): Promise<DashboardSummaryOutputDto> => {
    const { data } = await http.get<ApiResult<DashboardSummaryOutputDto>>(
        `${getPaymentDashboardPath()}/dashboard-summary`,
        { params },
    );
    return data.data;
};

const getHallOccupancyAsync = async (params: DashboardSummaryInputDto): Promise<HallOccupancyOutputDto> => {
    const { data } = await http.get<ApiResult<HallOccupancyOutputDto>>(
        `${getAdminDashboardPath()}/hall-occupancy`,
        { params },
    );
    return data.data;
};

const getPromotionSummaryAsync = async (): Promise<PromotionSummaryOutputDto> => {
    const { data } = await http.get<ApiResult<PromotionSummaryOutputDto>>(
        `${getAdminDashboardPath()}/promotion-summary`,
    );
    return data.data;
};

export const dashboardService = {
    getDashboardSummaryAsync,
    getHallOccupancyAsync,
    getPromotionSummaryAsync,
};
