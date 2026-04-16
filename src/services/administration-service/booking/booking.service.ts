import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PaymentOutputDto } from "./models/output.model";

class BookingService {
    private readonly prefix = "/ltc/payment-service/api/administration/admin";

    async getList(params: any): Promise<PagedResultDto<PaymentOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<PaymentOutputDto>>>(`${this.prefix}/payment-all`, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<PaymentOutputDto> {
        const response = await http.get<ApiResult<PaymentOutputDto>>(`${this.prefix}/payment/${id}`);
        return response.data.data;
    }
}

export const bookingService = new BookingService();
