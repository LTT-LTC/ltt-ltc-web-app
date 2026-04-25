import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { rootCustomerPath } from "../customer.service";
import { MemberTierOutputDto } from "@/src/services/administration-service/member-tier/models/output.model";

const path = `${rootCustomerPath}/customer/member-tier`;

const getMemberTierListAsync = async (params: { skipCount: number; maxResultCount: number }): Promise<PagedResultDto<MemberTierOutputDto>> => {
    const { data } = await http.get<PagedResultDto<MemberTierOutputDto>>(path, { params });
    return data;
};

export const customerMemberTierService = {
    getMemberTierListAsync,
};
