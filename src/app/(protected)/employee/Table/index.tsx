"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import Link from "next/link";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTPlusCircleIcon from "@/src/@core/component/LTTIcon/iconoir/plus-circle-icon";
import LTTImportIcon from "@/src/@core/component/LTTIcon/iconoir/import";
import EmployeeFilter from "../Filter";
import { useAppDispatch, useAppSelector } from "@/src/stores/hook";
import { administrationServiceStore } from "@/src/stores/administration-service";
import { useEffect, useState } from "react";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/src/@core/const";
import useLTTInitLoading from "@/src/@core/hooks/useLTTInitLoading";
import EmployeeListTab from "./Tab";
import AddEmployeeForm from "../Form/AddEmployeeForm";

const EmployeeListPage = () => {
  const dispatch = useAppDispatch();
  const { employeeList } = useAppSelector((state) => state.administrationServiceEmployee);
  const initLoading = useLTTInitLoading(employeeList.isLoading);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dispatch(
      administrationServiceStore.employee.getEmployeeList({
        page: DEFAULT_PAGE,
        fetch: DEFAULT_PAGE_SIZE,
        keyword: "",
        isActive: true,
      })
    );
  }, [refreshKey]);

  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Tổng quan" },
          { title: <Link href="/employee">Danh sách nhân sự</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          <LTTImportIcon />
          Thêm danh sách nhân sự
        </LTTButton>
        <LTTButton className="mb-3" onClick={() => setOpenAddForm(true)}>
          <LTTPlusCircleIcon />
          Thêm nhân sự mới
        </LTTButton>
      </div>
      <AddEmployeeForm
        open={openAddForm}
        onClose={() => setOpenAddForm(false)}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
      <LTTCard
        height="table"
        loading={initLoading}
        title="Danh sách nhân sự"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <EmployeeFilter />
        </div>
        <EmployeeListTab />
        <LTTTable
          columns={columns(employeeList.input.page, employeeList.input.fetch)}
          dataSource={employeeList.data.items}
          loading={employeeList.isLoading}
          pagination={{
            totalCount: employeeList.data.totalCount,
            page: employeeList.input.page,
            fetch: employeeList.input.fetch,
            onChange: (page: number, fetch: number) => {
              dispatch(
                administrationServiceStore.employee.getEmployeeList({
                  page,
                  fetch,
                  keyword: employeeList.input.keyword,
                  isActive: employeeList.input.isActive,
                })
              )
            },
          }}
        />
      </LTTCard>
    </>
  );
};

export default EmployeeListPage;
