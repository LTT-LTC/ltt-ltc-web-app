import { get } from "@/src/@core/utils/get";
import { customerAuthService } from "./auth/auth.service";
import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";

export const rootCustomerPath: string = get.rootPath("/customer-service");

const getAdminList = async (params: any): Promise<PagedResultDto<any>> => {
    const response = await http.get<PagedResultDto<any>>(`${rootCustomerPath}/profile/list`, { params });
    return response.data;
};

const deleteCustomer = async (id: string): Promise<void> => {
    await http.delete<void>(`${rootCustomerPath}/profile/${id}`);
};

const lockCustomer = async (id: string): Promise<void> => {
    await http.post<void>(`${rootCustomerPath}/profile/${id}/lock`);
};

const unlockCustomer = async (id: string): Promise<void> => {
    await http.post<void>(`${rootCustomerPath}/profile/${id}/unlock`);
};

export const customerService = {
    authService: customerAuthService,

    getCustomerAsync: getAdminList,
    deleteCustomerAsync: deleteCustomer,
    lockCustomerAsync: lockCustomer,
    unlockCustomerAsync: unlockCustomer,

    getAdminList,
    deleteCustomer,
    lockCustomer,
    unlockCustomer,
};