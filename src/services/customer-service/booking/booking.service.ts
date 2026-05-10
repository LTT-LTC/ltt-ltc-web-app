import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

export interface CreateBookingItemInputDto {
    itemType: "SEAT" | "COMBO" | "PRODUCT";
    referenceId?: string;
    variantId?: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
}

export interface CreateBookingInputDto {
    bookingId?: string;
    showtimeId: string;
    paymentMethod?: string;
    discountAmount?: number;
    items: CreateBookingItemInputDto[];
}

export interface PrepareBookingLineItemDto {
    itemType: "SEAT" | "COMBO" | "PRODUCT";
    referenceId?: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface PrepareBookingForPaymentInputDto {
    showtimeId: string;
    seatCodes: string[];
    snapshotJson?: string;
    discountAmount: number;
    totalPrice: number;
    items: PrepareBookingLineItemDto[];
}

export interface BookingOutputDto {
    id: string;
    userId?: string;
    showtimeId: string;
    bookingStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    discountAmount: number;
    totalPrice: number;
    paidAmount?: number;
    /** Comma-separated seat codes from API */
    seatCodes?: string;
    /** Cart/pricing JSON from prepare-for-payment */
    snapshotJson?: string;
    /** PascalCase when response JSON preserves .NET names */
    SeatCodes?: string;
    SnapshotJson?: string;
    createdAt?: string;
    updatedAt?: string;
    expiredAt?: string;
}

/** Query for `GET /customer-service/customer/booking` (ABP paging). */
export interface GetBookingListParams {
    page: number;
    fetch: number;
    /** ABP Dynamic LINQ sorting, e.g. `UpdatedAt DESC` */
    sorting?: string;
}

const rootPath = "/customer-service/customer/booking";

export const pickBookingSeatCodes = (item: BookingOutputDto): string | undefined => {
    const s = item.seatCodes ?? item.SeatCodes;
    return s?.trim() ? s : undefined;
};

export const pickBookingSnapshotJson = (item: BookingOutputDto): string | undefined =>
    item.snapshotJson ?? item.SnapshotJson;

const unwrap = <T>(payload: ApiResult<T> | T): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as ApiResult<T>).data;
    }
    return payload as T;
};

const createBookingAsync = async (body: CreateBookingInputDto): Promise<BookingOutputDto> => {
    const response = await http.post<ApiResult<BookingOutputDto> | BookingOutputDto>(rootPath, body);
    return unwrap(response.data);
};

const prepareBookingForPaymentAsync = async (
    bookingId: string,
    body: PrepareBookingForPaymentInputDto,
): Promise<BookingOutputDto> => {
    const response = await http.put<ApiResult<BookingOutputDto> | BookingOutputDto>(
        `${rootPath}/${bookingId}/prepare-for-payment`,
        body,
    );
    return unwrap(response.data);
};

const updateBookingPaymentMethodAsync = async (
    bookingId: string,
    paymentMethod: string,
): Promise<BookingOutputDto> => {
    const response = await http.patch<ApiResult<BookingOutputDto> | BookingOutputDto>(
        `${rootPath}/${bookingId}/payment-method`,
        { paymentMethod },
    );
    return unwrap(response.data);
};

const deleteBookingAsync = async (id: string): Promise<void> => {
    await http.delete(`${rootPath}/${id}`);
};

const getBookingListAsync = async (params: GetBookingListParams): Promise<PagedResultDto<BookingOutputDto>> => {
    const skipCount = Math.max(0, (params.page - 1) * params.fetch);
    const response = await http.get<ApiResult<PagedResultDto<BookingOutputDto>> | PagedResultDto<BookingOutputDto>>(
        rootPath,
        {
            params: {
                skipCount,
                maxResultCount: params.fetch,
                sorting: params.sorting ?? "UpdatedAt DESC",
            },
        },
    );
    return unwrap(response.data);
};

const getBookingByIdAsync = async (id: string): Promise<BookingOutputDto> => {
    const response = await http.get<ApiResult<BookingOutputDto> | BookingOutputDto>(`${rootPath}/${id}`);
    return unwrap(response.data);
};

export const customerBookingService = {
    createBookingAsync,
    prepareBookingForPaymentAsync,
    updateBookingPaymentMethodAsync,
    deleteBookingAsync,
    getBookingListAsync,
    getBookingByIdAsync,
};
