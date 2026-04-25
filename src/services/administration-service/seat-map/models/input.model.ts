export interface GetSeatMapListInputDto {
  page: number;
  fetch: number;
  keyword?: string;
}

export interface CreateSeatMapInputDto {
  name: string;
  description?: string;
  seatLayout?: string;
  seatCount: number;
}

export interface UpdateSeatMapInputDto {
  name: string;
  description?: string;
  seatLayout?: string;
  seatCount: number;
}
