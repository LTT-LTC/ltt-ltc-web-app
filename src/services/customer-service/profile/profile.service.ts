import http from "@/src/@core/http";
import { rootCustomerPath } from "../customer.service";
import { UpdateCustomerProfileInputDto } from "./models/input.model";
import { CustomerProfileOutputDto } from "./models/output.model";

const profilePath = "/profile";

const getProfileAsync = async (): Promise<CustomerProfileOutputDto> => {
    const { data } = await http.get<CustomerProfileOutputDto>(`${rootCustomerPath}${profilePath}`);
    return data;
};

const updateProfileAsync = async (body: UpdateCustomerProfileInputDto): Promise<CustomerProfileOutputDto> => {
    const { data } = await http.put<CustomerProfileOutputDto>(`${rootCustomerPath}${profilePath}`, body);
    return data;
};

export const customerProfileService = {
    getProfileAsync,
    updateProfileAsync,
};