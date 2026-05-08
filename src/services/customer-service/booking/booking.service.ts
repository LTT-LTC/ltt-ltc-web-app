import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

export interface CreateBookingItemInputDto {
    itemType: "SEAT" | "COMBO" | "PRODUCT";
    referenceId?: string;
    variantId?: string;
    quantity: number;
}

export interface CreateBookingInputDto {
    showtimeId: string;
    paymentMethod?: string;
    items: CreateBookingItemInputDto[];
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
    createdAt?: string;
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

const deleteBookingAsync = async (id: string): Promise<void> => {
    await http.delete(`${rootPath}/${id}`);
};

export const customerBookingService = {
    createBookingAsync,
    deleteBookingAsync,
};
