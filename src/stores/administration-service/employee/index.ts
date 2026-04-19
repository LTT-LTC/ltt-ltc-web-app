import { administrationService } from "@/src/services/administration-service/administration.service";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { initState } from "./index.state";
import { GetListEmployeeInputDto } from "@/src/services/administration-service/employee/models/input.model";
const serviceName = "(administration)-service";

const getEmployeeList = createAsyncThunk(
    `/${serviceName}/employee/getEmployeeList`,
    async (params: GetListEmployeeInputDto) => {
        const data =
            await administrationService.employeeService.getList(params);
        return { data, input: params };
    },
);

export const employeeSlice = createSlice({
    name: `${serviceName}/employee`,
    initialState: initState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getEmployeeList.pending, (state) => {
                state.employeeList.isLoading = true;
            })
            .addCase(getEmployeeList.fulfilled, (state, action) => {
                state.employeeList.isLoading = false;
                state.employeeList.data = action.payload.data;
                state.employeeList.input = action.payload.input;
            })
            .addCase(getEmployeeList.rejected, (state) => {
                state.employeeList.isLoading = false;
            });
    },
});

export default employeeSlice.reducer;

export const employeeActions = {
    getEmployeeList,
};