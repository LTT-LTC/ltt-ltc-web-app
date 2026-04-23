import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { rootCustomerPath } from "../customer.service";
import {
    CreateMemberCardRequestInputDto,
    DeleteMemberCardRequestInputDto,
    UpdateMemberCardRequestInputDto,
} from "./models/input.model";
import {
    MemberCardOutputDto,
    MemberCardRequestOutputDto,
    PointTransactionOutputDto,
} from "./models/output.model";

const path = `${rootCustomerPath}/customer/member-card`;

const getActiveAsync = async (): Promise<MemberCardOutputDto> => {
    const { data } = await http.get<MemberCardOutputDto>(path);
    return data;
};

const getAsync = async (id: string): Promise<MemberCardOutputDto> => {
    const { data } = await http.get<MemberCardOutputDto>(`${path}/${id}`);
    return data;
};

const getPointHistoryAsync = async (params: { skipCount: number; maxResultCount: number }): Promise<PagedResultDto<PointTransactionOutputDto>> => {
    const { data } = await http.get<PagedResultDto<PointTransactionOutputDto>>(`${path}/point-transaction-all`, { params });
    return data;
};

const requestCreateAsync = async (body: CreateMemberCardRequestInputDto): Promise<MemberCardRequestOutputDto> => {
    const { data } = await http.post<MemberCardRequestOutputDto>(path, body);
    return data;
};

const requestUpdateAsync = async (id: string, body: UpdateMemberCardRequestInputDto): Promise<MemberCardRequestOutputDto> => {
    const { data } = await http.put<MemberCardRequestOutputDto>(`${path}/${id}`, body);
    return data;
};

const requestDeleteAsync = async (id: string, body: DeleteMemberCardRequestInputDto): Promise<MemberCardRequestOutputDto> => {
    const { data } = await http.delete<MemberCardRequestOutputDto>(`${path}/${id}`, { data: body });
    return data;
};

const getMyRequestsAsync = async (params: { skipCount: number; maxResultCount: number }): Promise<PagedResultDto<MemberCardRequestOutputDto>> => {
    const { data } = await http.get<PagedResultDto<MemberCardRequestOutputDto>>(`${path}/request-all`, { params });
    return data;
};

export const customerMemberCardService = {
    getActiveAsync,
    getAsync,
    getPointHistoryAsync,
    requestCreateAsync,
    requestUpdateAsync,
    requestDeleteAsync,
    getMyRequestsAsync,
};
