import { get } from "@/src/@core/utils/get";
import http from "@/src/@core/http";

export const rootPath: string = get.rootPath("/customer-service/api/profile");

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

export interface UpdateCustomerProfileInputDto {
  name: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  emailAddress?: string;
  address?: string;
}

export const partyService = {
  getProfileAsync: async (): Promise<CustomerProfileOutputDto> => {
    return await http.get(rootPath);
  },
  updateProfileAsync: async (input: UpdateCustomerProfileInputDto): Promise<CustomerProfileOutputDto> => {
    return await http.put(rootPath, input);
  },
};
