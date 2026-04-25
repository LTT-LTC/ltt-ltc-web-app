import http from "@/src/@core/http";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { rootPath } from "../administration.service";
import {
    GetGiftCodeListInputDto,
    CreateGiftCodeInputDto,
    UpdateGiftCodeInputDto
} from "./models/input.model";
import { GiftCodeOutputDto } from "./models/output.model";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { toAbpPaginationParams } from "../_shared/pagination";
const path = "/gift-codes";

const getGiftCodeListAsync = async (params: GetGiftCodeListInputDto): Promise<PagedResultDto<GiftCodeOutputDto>> => {
    const response = await http.get<ApiResult<PagedResultDto<GiftCodeOutputDto>>>(`${rootPath}${path}`, {
        params: toAbpPaginationParams(params)
    });
    return response.data.data;
};

const createGiftCodeAsync = async (body: CreateGiftCodeInputDto): Promise<GiftCodeOutputDto> => {
    const response = await http.post<ApiResult<GiftCodeOutputDto>>(`${rootPath}${path}`, body);
    return response.data.data;
};

const updateGiftCodeAsync = async (id: string, body: UpdateGiftCodeInputDto): Promise<GiftCodeOutputDto> => {
    const response = await http.put<ApiResult<GiftCodeOutputDto>>(`${rootPath}${path}/${id}`, body);
    return response.data.data;
}

const deleteGiftCodeAsync = async (id: string): Promise<void> => {
    await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
};

export const giftCodeService = {
    getGiftCodeListAsync,
    createGiftCodeAsync,
    updateGiftCodeAsync,
    deleteGiftCodeAsync,
};