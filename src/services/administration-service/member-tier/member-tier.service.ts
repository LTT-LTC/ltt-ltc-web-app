import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import {
    CreateMemberTierInputDto,
    GetMemberTierListInputDto,
    UpdateMemberTierInputDto,
} from "./models/input.model";
import { MemberTierOutputDto } from "./models/output.model";

const path = "/customer-service/admin/member-tier";

const getMemberTierListAsync = async (params: GetMemberTierListInputDto): Promise<PagedResultDto<MemberTierOutputDto>> => {
    const { data } = await http.get<PagedResultDto<MemberTierOutputDto>>(path, { params });
    return data;
};

const getMemberTierByIdAsync = async (id: string): Promise<MemberTierOutputDto> => {
    const { data } = await http.get<MemberTierOutputDto>(`${path}/${id}`);
    return data;
};

const createMemberTierAsync = async (body: CreateMemberTierInputDto): Promise<MemberTierOutputDto> => {
    const { data } = await http.post<MemberTierOutputDto>(path, body);
    return data;
};

const updateMemberTierAsync = async (id: string, body: UpdateMemberTierInputDto): Promise<MemberTierOutputDto> => {
    const { data } = await http.put<MemberTierOutputDto>(`${path}/${id}`, body);
    return data;
};

const deleteMemberTierAsync = async (id: string): Promise<void> => {
    await http.delete<void>(`${path}/${id}`);
};

export const memberTierService = {
    getMemberTierListAsync,
    getMemberTierByIdAsync,
    createMemberTierAsync,
    updateMemberTierAsync,
    deleteMemberTierAsync,
};
