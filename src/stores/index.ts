import employeeSlice, { employeeActions } from "./employee";

export const administrationServiceSlice = {
    employee: employeeSlice,
}

export const administrationServiceStore = {
    employee: employeeActions,
}