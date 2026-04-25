import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { MemberCardRequestOutputDto } from "./models/output.model";
import { GetMemberCardRequestListInputDto, ReviewMemberCardRequestInputDto } from "./models/input.model";

const path = "/customer-service/admin/member-card-request";

const getListAsync = async (params: GetMemberCardRequestListInputDto): Promise<PagedResultDto<MemberCardRequestOutputDto>> => {
    const { data } = await http.get<PagedResultDto<MemberCardRequestOutputDto>>(path, { params });
    return data;
};

const approveAsync = async (requestId: string, body: ReviewMemberCardRequestInputDto): Promise<MemberCardRequestOutputDto> => {
    const { data } = await http.post<MemberCardRequestOutputDto>(`${path}/${requestId}/approve`, body);
    return data;
};

const rejectAsync = async (requestId: string, body: ReviewMemberCardRequestInputDto): Promise<MemberCardRequestOutputDto> => {
    const { data } = await http.post<MemberCardRequestOutputDto>(`${path}/${requestId}/reject`, body);
    return data;
};

export const memberCardRequestService = {
    getListAsync,
    approveAsync,
    rejectAsync,
};
