import LTTTabs, { LTTPrefixProps } from "@/src/@core/component/AntD/LTTTabs";
import { administrationServiceStore } from "@/src/stores/administration-service";
import { useAppDispatch, useAppSelector } from "@/src/stores/hook";

const EmployeeListTab = () => {
  const dispatch = useAppDispatch();
  const { employeeList } = useAppSelector(
    (state) => state.administrationServiceEmployee,
  );

  const items = [
    {
      key: "1",
      label: "Đang hoạt động",
      prefix: {
        value: employeeList.data?.extendData?.totalActiveEmployees,
        variant: "solid",
        color: "success",
      } as LTTPrefixProps,
    },
    {
      key: "0",
      label: "Vô hiệu hóa",
      prefix: {
        value: employeeList.data?.extendData?.totalDeactiveEmployees ?? 0,
        variant: "solid",
        color: "error",
      } as LTTPrefixProps,
    },
  ];

  return (
    <LTTTabs
      defaultActiveKey="1"
      onChange={(key) => {
        dispatch(
          administrationServiceStore.employee.getEmployeeList({
            ...employeeList.input,
            isActive: key === "1",
          }),
        );
      }}
      items={items}
    />
  );
};

export default EmployeeListTab;
