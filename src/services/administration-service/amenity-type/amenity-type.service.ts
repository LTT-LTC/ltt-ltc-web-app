import http from "@/src/@core/http";
import { rootPath } from "../administration.service";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { GetAmenityTypeListInputDto, CreateAmenityTypeInputDto, UpdateAmenityTypeInputDto } from "./models/input.model";
import { AmenityTypeOutputDto } from "./models/output.model";

const path = "/amenity-type";

const getAmenityTypeAsync = async (params?: GetAmenityTypeListInputDto) => {
    const { data } = await http.get<ApiResult<PagedResultDto<AmenityTypeOutputDto>>>(`${rootPath}${path}-all`, { params });
    return data.data;
};

const getAmenityTypeByIdAsync = async (id: string) => {
    const { data } = await http.get<ApiResult<AmenityTypeOutputDto>>(`${rootPath}${path}/${id}`);
    return data.data;
};

const createAmenityTypeAsync = async (body: CreateAmenityTypeInputDto) => {
    const { data } = await http.post<ApiResult<AmenityTypeOutputDto>>(`${rootPath}${path}`, body);
    return data.data;
};

const updateAmenityTypeAsync = async (id: string, body: UpdateAmenityTypeInputDto) => {
    const { data } = await http.put<ApiResult<AmenityTypeOutputDto>>(`${rootPath}${path}/${id}`, body);
    return data.data;
};

const deleteAmenityTypeAsync = async (id: string) => {
    const { data } = await http.delete<ApiResult<void>>(`${rootPath}${path}/${id}`);
    return data.data;
};

export const amenityTypeService = {
    getAmenityTypeAsync,
    getAmenityTypeByIdAsync,
    createAmenityTypeAsync,
    updateAmenityTypeAsync,
    deleteAmenityTypeAsync,
};
