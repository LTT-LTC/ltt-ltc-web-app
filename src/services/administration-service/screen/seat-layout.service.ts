import http from "@/src/@core/http";


const prefix = "/administration/admin";

export const seatLayoutService = {
    async getAll(screenId: string): Promise<SeatLayoutDto[]> {
        const { data } = await http.get(`${prefix}/screen/${screenId}/seat-layout-all`);
        return data;
    },
    async get(id: string): Promise<SeatLayoutDto> {
        const { data } = await http.get(`${prefix}/seat-layout/${id}`);
        return data;
    },
    async create(body: CreateSeatLayoutDto): Promise<SeatLayoutDto> {
        const { data } = await http.post(`${prefix}/seat-layout`, body);
        return data;
    },
    async update(id: string, body: UpdateSeatLayoutDto): Promise<SeatLayoutDto> {
        const { data } = await http.put(`${prefix}/seat-layout/${id}`, body);
        return data;
    },
    async delete(id: string): Promise<void> {
        await http.delete(`${prefix}/seat-layout/${id}`);
    },
};
