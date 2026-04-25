import http from "@/src/@core/http";
import { CreateSeatLayoutDto, UpdateSeatLayoutDto } from "../../screen/models/input.model";
import { SeatLayoutDto } from "../../screen/models/output.model";
import { seatMapService } from "../../seat-map/seat-map.service";

const fallbackCinemaStorageKey = "managerCinemaId";

const getManagerCinemaId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  const fromStorage = localStorage.getItem(fallbackCinemaStorageKey) || "";
  return fromStorage || undefined;
};

const parseSeatLayout = (value?: string): SeatMapPayload | null => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

interface SeatMapRowPayload {
  seats?: unknown[];
}

interface SeatMapPayload {
  rows?: SeatMapRowPayload[];
}

interface ScreenListResponseItem {
  id: string;
  name: string;
  seatLayout?: string;
}

const countSeats = (layout?: SeatMapPayload): number => {
  if (!layout?.rows) return 0;
  return layout.rows.reduce((acc, row) => acc + (Array.isArray(row.seats) ? row.seats.length : 0), 0);
};

const getSeatLayoutsAsync = async (screenId: string): Promise<SeatLayoutDto[]> => {
  const { data } = await http.get(`/ltc/administration-service/manager/seatmaps/cinema/${screenId}`);
  if (!data?.items) return [];
  return data.items.map((item: ScreenListResponseItem) => ({
    id: item.id,
    screenId: item.id,
    name: item.name,
    layout: parseSeatLayout(item.seatLayout),
    createdAt: "",
    updatedAt: "",
  }));
};

const getSeatLayoutByIdAsync = async (_screenId: string, id: string): Promise<SeatLayoutDto> => {
  const data = await seatMapService.getSeatMapByIdAsync(id);
  return {
    id: data.id,
    screenId: data.id,
    name: data.name,
    layout: parseSeatLayout(data.seatLayout),
    createdAt: "",
    updatedAt: "",
  };
};

const createSeatLayoutAsync = async (screenId: string, body: CreateSeatLayoutDto): Promise<SeatLayoutDto> => {
  const cinemaId = getManagerCinemaId();
  if (!cinemaId) {
    throw new Error("Missing manager cinema context.");
  }
  const created = await seatMapService.createSeatMapAsync(cinemaId, {
    name: body.name,
    seatLayout: JSON.stringify(body.layout),
    seatCount: countSeats(body.layout as SeatMapPayload),
  });
  return {
    id: created.id,
    screenId: created.id,
    name: created.name,
    layout: parseSeatLayout(created.seatLayout),
    createdAt: "",
    updatedAt: "",
  };
};

const updateSeatLayoutAsync = async (_screenId: string, id: string, body: UpdateSeatLayoutDto): Promise<SeatLayoutDto> => {
  const current = await seatMapService.getSeatMapByIdAsync(id);
  const updated = await seatMapService.updateSeatMapAsync(id, {
    name: body.name || current.name,
    description: current.description,
    seatCount: body.layout ? countSeats(body.layout as SeatMapPayload) : current.seatCount,
    seatLayout: body.layout ? JSON.stringify(body.layout) : current.seatLayout,
  });
  return {
    id: updated.id,
    screenId: updated.id,
    name: updated.name,
    layout: parseSeatLayout(updated.seatLayout),
    createdAt: "",
    updatedAt: "",
  };
};

const deleteSeatLayoutAsync = async (_screenId: string, id: string): Promise<void> => {
  await seatMapService.deleteSeatMapAsync(id);
};

export const managerSeatMapEditorService = {
  getSeatLayoutsAsync,
  getSeatLayoutByIdAsync,
  createSeatLayoutAsync,
  updateSeatLayoutAsync,
  deleteSeatLayoutAsync,
};
