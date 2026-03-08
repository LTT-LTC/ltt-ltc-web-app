import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/src/@core/const";
import { ResponseDataWithInput } from "@/src/@core/http/models/ResponseTypeDto";
import { GetListEmployeeInputDto } from "@/src/services/administration-service/employee/models/input.model";
import { PagedResultEmployeeOutputDto } from "@/src/services/administration-service/employee/models/output.model";

export declare type EmployeeState = {
    employeeList: ResponseDataWithInput<
        GetListEmployeeInputDto,
        PagedResultEmployeeOutputDto
    >;
};

export const initState: EmployeeState = {
    employeeList: {
        isLoading: false,
        data: {} as PagedResultEmployeeOutputDto,
        input: {
            page: DEFAULT_PAGE,
            fetch: DEFAULT_PAGE_SIZE,
            keyword: "",
        },
    },
};
