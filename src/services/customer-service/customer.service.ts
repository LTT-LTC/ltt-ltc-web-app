import { get } from "@/src/@core/utils/get";
import { customerAuthService } from "./auth/auth.service";
import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { ApiResult } from "@/src/@core/http/models/ApiResult";

export const rootCustomerPath: string = get.rootPath("/customer-service/api");

export const customerService = {
    authService: customerAuthService,
    
    // Admin methods
    async getAdminList(params: any): Promise<PagedResultDto<any>> {
        const response = await http.get<ApiResult<PagedResultDto<any>>>(`${rootCustomerPath}/customer`, { params });
        return response.data.data;
    },

    async deleteCustomer(id: string): Promise<void> {
        await http.delete<ApiResult<void>>(`${rootCustomerPath}/customer/${id}`);
    },

    async lockCustomer(id: string): Promise<void> {
        await http.post<ApiResult<void>>(`${rootCustomerPath}/customer/${id}/lock`);
    },

    async unlockCustomer(id: string): Promise<void> {
        await http.post<ApiResult<void>>(`${rootCustomerPath}/customer/${id}/unlock`);
    }
};