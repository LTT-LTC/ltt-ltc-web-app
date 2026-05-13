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
    seatCodes?: string;
    snapshotJson?: string;
    createdAt?: string;
    updatedAt?: string;
    expiredAt?: string;
}

export interface ConfirmBookingPaymentOutputDto {
    success: boolean;
    message: string;
    bookingStatus?: string;
    paymentStatus?: string;
}

export interface GetBookingListInputDto {
    page: number;
    fetch: number;
}

const rootPath = "/customer-service/customer/booking";

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

const getBookingAsync = async (id: string): Promise<BookingOutputDto> => {
    const response = await http.get<ApiResult<BookingOutputDto> | BookingOutputDto>(`${rootPath}/${id}`);
    return unwrap(response.data);
};

const getBookingListAsync = async (params: GetBookingListInputDto): Promise<PagedResultDto<BookingOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<BookingOutputDto>> | PagedResultDto<BookingOutputDto>>(
        rootPath,
        {
            params: {
                skipCount: Math.max(0, (params.page - 1) * params.fetch),
                maxResultCount: params.fetch,
            },
        },
    );
    return unwrap(response.data);
};

const deleteBookingAsync = async (id: string): Promise<void> => {
    await http.delete(`${rootPath}/${id}`);
};

const confirmBookingPaymentAsync = async (
    bookingId: string
): Promise<ConfirmBookingPaymentOutputDto> => {
    const response = await http.post<ApiResult<ConfirmBookingPaymentOutputDto> | ConfirmBookingPaymentOutputDto>(
        `${rootPath}/${bookingId}/confirm-payment`
    );
    return unwrap(response.data);
};

export const customerBookingService = {
    createBookingAsync,
    getBookingAsync,
    getBookingListAsync,
    prepareBookingForPaymentAsync,
    updateBookingPaymentMethodAsync,
    deleteBookingAsync,
    confirmBookingPaymentAsync,
};
