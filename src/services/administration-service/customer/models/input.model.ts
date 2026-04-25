export interface GetCustomerListInputDto {
    page: number;
    fetch: number;
    keyword?:string;
    status?:string;
}