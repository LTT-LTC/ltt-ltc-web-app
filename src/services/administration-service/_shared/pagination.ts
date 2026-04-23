export interface PaginationQueryInput {
  page: number;
  fetch: number;
  keyword?: string;
}

export const toAbpPaginationParams = (input: PaginationQueryInput) => ({
  skipCount: Math.max(0, (input.page - 1) * input.fetch),
  maxResultCount: input.fetch,
  keyword: input.keyword,
});
