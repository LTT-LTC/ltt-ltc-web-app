import http from "@/src/@core/http";
import { rootPath } from "../../administration.service";
import { CreateSeatLayoutDto, UpdateSeatLayoutDto } from "../../screen/models/input.model";
import { SeatLayoutDto } from "../../screen/models/output.model";
import { screenService } from "../../screen/screen.service";

const screensPath = "/screens/cinema";
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
  screenNumber: number;
  seatLayout?: string;
}

const countSeats = (layout?: SeatMapPayload): number => {
  if (!layout?.rows) return 0;
  return layout.rows.reduce((acc, row) => acc + (Array.isArray(row.seats) ? row.seats.length : 0), 0);
};

const getSeatLayoutsAsync = async (screenId: string): Promise<SeatLayoutDto[]> => {
  const { data } = await http.get(`${rootPath}/${screensPath}/${screenId}`);
  if (!data?.items) return [];
  return data.items.map((item: ScreenListResponseItem) => ({
    id: item.id,
    screenId: item.id,
    name: `Screen ${item.screenNumber}`,
    layout: parseSeatLayout(item.seatLayout),
    createdAt: "",
    updatedAt: "",
  }));
};

const getSeatLayoutByIdAsync = async (_screenId: string, id: string): Promise<SeatLayoutDto> => {
  const cinemaId = getManagerCinemaId();
  const data = await screenService.getScreenByIdAsync(cinemaId ?? "", id);
  return {
    id: data.id,
    screenId: data.id,
    name: `Screen ${data.screenNumber}`,
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
  const created = await screenService.createScreenAsync(cinemaId, {
    screenNumber: Number(body.name) || 1,
    screenType: "2D",
    seatLayout: JSON.stringify(body.layout),
    seatCount: countSeats(body.layout as SeatMapPayload),
    status: "active",
  });
  return {
    id: created.id,
    screenId: created.id,
    name: `Screen ${created.screenNumber}`,
    layout: parseSeatLayout(created.seatLayout),
    createdAt: "",
    updatedAt: "",
  };
};

const updateSeatLayoutAsync = async (_screenId: string, id: string, body: UpdateSeatLayoutDto): Promise<SeatLayoutDto> => {
  const cinemaId = getManagerCinemaId();
  if (!cinemaId) {
    throw new Error("Missing manager cinema context.");
  }
  const current = await screenService.getScreenByIdAsync(cinemaId, id);
  const updated = await screenService.updateScreenAsync(cinemaId, id, {
    screenNumber: current.screenNumber,
    screenType: current.screenType || "2D",
    status: current.status || "active",
    seatCount: body.layout ? countSeats(body.layout as SeatMapPayload) : current.seatCount,
    seatLayout: body.layout ? JSON.stringify(body.layout) : current.seatLayout,
  });
  return {
    id: updated.id,
    screenId: updated.id,
    name: `Screen ${updated.screenNumber}`,
    layout: parseSeatLayout(updated.seatLayout),
    createdAt: "",
    updatedAt: "",
  };
};

const deleteSeatLayoutAsync = async (_screenId: string, id: string): Promise<void> => {
  const cinemaId = getManagerCinemaId();
  if (!cinemaId) {
    throw new Error("Missing manager cinema context.");
  }
  await screenService.deleteScreenAsync(cinemaId, id);
};

export const managerSeatMapEditorService = {
  getSeatLayoutsAsync,
  getSeatLayoutByIdAsync,
  createSeatLayoutAsync,
  updateSeatLayoutAsync,
  deleteSeatLayoutAsync,
};
