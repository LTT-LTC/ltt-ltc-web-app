import { get } from "@/src/@core/utils/get";
import { authService } from "./auth/auth.service";
import { employeeService } from "./employee/employee.service";

export const rootPath: string = get.rootPath("/(administration)-service/api");

export const administrationService = {
    authService: authService,
    employeeService: employeeService,
}