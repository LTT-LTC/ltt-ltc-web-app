export interface GetCustomerListInputDto {
    skipCount: number;
    maxResultCount: number;
    filter?: string;
    status?: string;
}