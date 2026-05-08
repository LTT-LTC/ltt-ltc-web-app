import http from "@/src/@core/http";
import { ApiResult } from "@/src/@core/http/models/ApiResult";
import { ScreenOutputDto } from "@/src/services/administration-service/screen/models/output.model";

const rootPath = "/administration-service/customer/screens";

const unwrap = <T>(payload: ApiResult<T> | T): T => {
    if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
        return (payload as ApiResult<T>).data;
    }
    return payload as T;
};

const getScreenAsync = async (id: string): Promise<ScreenOutputDto> => {
    const response = await http.get<ApiResult<ScreenOutputDto> | ScreenOutputDto>(`${rootPath}/${id}`);
    return unwrap(response.data);
};

export const customerScreenService = {
    getScreenAsync,
};

export type { ScreenOutputDto };
