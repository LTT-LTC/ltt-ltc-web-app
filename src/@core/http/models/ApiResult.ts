export interface ErrorResultDto {
    code?: string | null;
    message: string;
    details?: any | null;
}

export interface BaseResultDto {
    status: string;
    error: ErrorResultDto | null;
    statusCode: number;
    message: string;
    systemName: string;
}

export interface ApiResult<T> extends BaseResultDto {
    data: T;
}