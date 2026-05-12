import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

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

const deleteBookingAsync = async (id: string): Promise<void> => {
    await http.delete(`${rootPath}/${id}`);
};

export const customerBookingService = {
    createBookingAsync,
    getBookingAsync,
    prepareBookingForPaymentAsync,
    updateBookingPaymentMethodAsync,
    deleteBookingAsync,
};
