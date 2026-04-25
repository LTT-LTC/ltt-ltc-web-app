import http from "@/src/@core/http";
import { SeatLayoutDto } from "./models/output.model";
import { CreateSeatLayoutDto, UpdateSeatLayoutDto } from "./models/input.model";
import { rootPath } from "../administration.service";

const path = "/screens";
const subPath = "/seat-layouts";

const getSeatLayoutsAsync = async (screenId: string): Promise<SeatLayoutDto[]> => {
    const { data } = await http.get(`${rootPath}${path}/${screenId}${subPath}`);
    return data;
};

const getSeatLayoutByIdAsync = async (screenId: string, id: string): Promise<SeatLayoutDto> => {
    const { data } = await http.get(`${rootPath}${path}/${screenId}${subPath}/${id}`);
    return data;
};

const createSeatLayoutAsync = async (screenId: string, body: CreateSeatLayoutDto): Promise<SeatLayoutDto> => {
    const { data } = await http.post(`${rootPath}${path}/${screenId}${subPath}`, body);
    return data;
};

const updateSeatLayoutAsync = async (screenId: string, id: string, body: UpdateSeatLayoutDto): Promise<SeatLayoutDto> => {
    const { data } = await http.put(`${rootPath}${path}/${screenId}${subPath}/${id}`, body);
    return data;
};

const deleteSeatLayoutAsync = async (screenId: string, id: string): Promise<void> => {
    await http.delete(`${rootPath}${path}/${screenId}${subPath}/${id}`);
};

export const seatLayoutService = {
    getSeatLayoutsAsync,
    getSeatLayoutByIdAsync,
    createSeatLayoutAsync,
    updateSeatLayoutAsync,
    deleteSeatLayoutAsync,
};