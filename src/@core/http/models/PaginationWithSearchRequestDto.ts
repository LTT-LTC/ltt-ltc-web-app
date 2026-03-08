export interface PaginationRequestDto {
  page: number;
  fetch: number;
}

export interface PaginationWithSearchRequestDto extends PaginationRequestDto {
  keyword?: string;
}
