import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { 
    RefundOutputDto, 
    ApproveRefundInputDto, 
    RejectRefundInputDto 
} from "../masterdata/models/refund.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

class RefundService {
    private readonly prefix = "/payment-service/api";

    async getList(params: any): Promise<PagedResultDto<RefundOutputDto>> {
        const response = await http.get<ApiResult<PagedResultDto<RefundOutputDto>>>(`${this.prefix}/refund-all`, { params });
        return response.data.data;
    }

    async getById(id: string): Promise<RefundOutputDto> {
        const response = await http.get<ApiResult<RefundOutputDto>>(`${this.prefix}/refund/${id}`);
        return response.data.data;
    }

    async create(body: any): Promise<RefundOutputDto> {
        const response = await http.post<ApiResult<RefundOutputDto>>(`${this.prefix}/refund`, body);
        return response.data.data;
    }

    // These endpoints might be in a different controller or have different names
    async approve(id: string): Promise<void> {
        await http.put<ApiResult<void>>(`${this.prefix}/refund/${id}/approve`);
    }

    async reject(id: string, reason: string): Promise<void> {
        await http.put<ApiResult<void>>(`${this.prefix}/refund/${id}/reject`, { reason });
    }
}

export const refundService = new RefundService();
