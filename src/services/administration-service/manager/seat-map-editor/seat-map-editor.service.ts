import http from "@/src/@core/http";
import { rootPath } from "../../administration.service";
import { CreateSeatLayoutDto, UpdateSeatLayoutDto } from "../../screen/models/input.model";
import { SeatLayoutDto } from "../../screen/models/output.model";

const screensPath = "/screens";
const layoutsPath = "/seat-layouts";

const getSeatLayoutsAsync = async (screenId: string): Promise<SeatLayoutDto[]> => {
  const { data } = await http.get(`${rootPath}${screensPath}/${screenId}${layoutsPath}`);
  return data;
};

const getSeatLayoutByIdAsync = async (screenId: string, id: string): Promise<SeatLayoutDto> => {
  const { data } = await http.get(`${rootPath}${screensPath}/${screenId}${layoutsPath}/${id}`);
  return data;
};

const createSeatLayoutAsync = async (screenId: string, body: CreateSeatLayoutDto): Promise<SeatLayoutDto> => {
  const { data } = await http.post(`${rootPath}${screensPath}/${screenId}${layoutsPath}`, body);
  return data;
};

const updateSeatLayoutAsync = async (screenId: string, id: string, body: UpdateSeatLayoutDto): Promise<SeatLayoutDto> => {
  const { data } = await http.put(`${rootPath}${screensPath}/${screenId}${layoutsPath}/${id}`, body);
  return data;
};

const deleteSeatLayoutAsync = async (screenId: string, id: string): Promise<void> => {
  await http.delete(`${rootPath}${screensPath}/${screenId}${layoutsPath}/${id}`);
};

export const managerSeatMapEditorService = {
  getSeatLayoutsAsync,
  getSeatLayoutByIdAsync,
  createSeatLayoutAsync,
  updateSeatLayoutAsync,
  deleteSeatLayoutAsync,
};
