export interface SeatMapOutputDto {
  id: string;
  tenantId?: string;
  cinemaId: string;
  name: string;
  description?: string;
  seatLayout?: string;
  seatCount: number;
  createdAt?: string;
  updatedAt?: string;
}
