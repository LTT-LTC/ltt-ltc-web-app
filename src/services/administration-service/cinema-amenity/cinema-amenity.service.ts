import http from "@/src/@core/http";
import { rootPath } from "../administration.service";
import { PagedResultDto } from "@/src/@core/http/models/PagedResultDto";
import { GetCinemaAmenityListInputDto, CreateCinemaAmenityInputDto, UpdateCinemaAmenityInputDto } from "./models/input.model";
import { CinemaAmenityOutputDto } from "./models/output.model";

const cinemaPath = "/cinema";
const amenityPath = "/amenity";

const getCinemaAmenityListAsync = async (cinemaId: string, params?: GetCinemaAmenityListInputDto) => {
    const { data } = await http.get<PagedResultDto<CinemaAmenityOutputDto>>(`${rootPath}${cinemaPath}/${cinemaId}${amenityPath}`, { params });
    return data;
};

const getCinemaAmenityByIdAsync = async (cinemaId: string, amenityId: string) => {
    const { data } = await http.get<CinemaAmenityOutputDto>(`${rootPath}${cinemaPath}/${cinemaId}${amenityPath}/${amenityId}`);
    return data;
};

const createCinemaAmenityAsync = async (cinemaId: string, body: CreateCinemaAmenityInputDto) => {
    const { data } = await http.post<CinemaAmenityOutputDto>(`${rootPath}${cinemaPath}/${cinemaId}${amenityPath}`, body);
    return data;
};

const updateCinemaAmenityAsync = async (cinemaId: string, amenityId: string, body: UpdateCinemaAmenityInputDto) => {
    const { data } = await http.put<CinemaAmenityOutputDto>(`${rootPath}${cinemaPath}/${cinemaId}${amenityPath}/${amenityId}`, body);
    return data;
};

const deleteCinemaAmenityAsync = async (cinemaId: string, amenityId: string) => {
    const { data } = await http.delete<void>(`${rootPath}${cinemaPath}/${cinemaId}${amenityPath}/${amenityId}`);
    return data;
};

export const cinemaAmenityService = {
    getCinemaAmenityListAsync,
    getCinemaAmenityByIdAsync,
    createCinemaAmenityAsync,
    updateCinemaAmenityAsync,
    deleteCinemaAmenityAsync,
};
