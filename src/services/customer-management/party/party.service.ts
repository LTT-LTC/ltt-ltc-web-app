import http from "@/src/@core/http";
import { rootCustomerPath } from "@/src/services/customer-service/customer.service";

export interface CustomerProfileOutputDto {
    id: string;
    name: string;
    phoneNumber?: string;
    gender?: string;
    dateOfBirth?: string;
    emailAddress?: string;
    address?: string;
    memberCode?: string;
}

type UpdateCustomerProfileInput = {
    name?: string;
    phoneNumber?: string;
    gender?: string;
    dateOfBirth?: string | null;
    emailAddress?: string;
    address?: string;
};

const getProfileAsync = async (): Promise<CustomerProfileOutputDto> => {
    try {
        const { data } = await http.get<CustomerProfileOutputDto>(`${rootCustomerPath}/profile/me`);
        return data;
    } catch {
        const { data } = await http.get<CustomerProfileOutputDto>(`${rootCustomerPath}/profile`);
        return data;
    }
};

const updateProfileAsync = async (
    body: UpdateCustomerProfileInput,
): Promise<CustomerProfileOutputDto> => {
    try {
        const { data } = await http.put<CustomerProfileOutputDto>(`${rootCustomerPath}/profile/me`, body);
        return data;
    } catch {
        const { data } = await http.put<CustomerProfileOutputDto>(`${rootCustomerPath}/profile`, body);
        return data;
    }
};

export const partyService = {
    getProfileAsync,
    updateProfileAsync,
};
