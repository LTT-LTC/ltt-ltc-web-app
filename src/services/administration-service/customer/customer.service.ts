import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { GetCustomerListInputDto } from "@/src/services/administration-service/customer/models/input.model";
import { CustomerOutputDto } from "../customer/models/output.model";

const path = "/customer-service";
const customerPath = "/customer-all";
const adminProfilePath = "/profile";

const getCustomerListAsync = async (params: GetCustomerListInputDto) => {
    const { data } = await http.get<PagedResultDto<CustomerOutputDto>>(`${path}${customerPath}`, { params });
    return data;
}

const getCustomerByIdAsync = async (id: string) => {
    const { data } = await http.get<CustomerOutputDto>(`${path}${customerPath}/${id}`);
    return data;
}

const deleteCustomerAsync = async (id: string): Promise<void> => {
    await http.delete(`${path}${adminProfilePath}/${id}`);
}

const lockCustomerAsync = async (id: string): Promise<void> => {
    await http.post(`${path}${adminProfilePath}/${id}/lock`);
}

const unlockCustomerAsync = async (id: string): Promise<void> => {
    await http.post(`${path}${adminProfilePath}/${id}/unlock`);
}

export const customerService = {
    getCustomerListAsync,
    getCustomerByIdAsync,
    deleteCustomerAsync,
    lockCustomerAsync,
    unlockCustomerAsync,
}