import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";
import { administrationServiceStore } from "@/src/stores/administration-service";
import { useAppDispatch, useAppSelector } from "@/src/stores/hook";

type EmployeeFilterProps = {
  className?: string;
};

const EmployeeFilter = ({ ...props }: EmployeeFilterProps) => {
  const dispatch = useAppDispatch();
  const { employeeList } = useAppSelector(
    (state) => state.administrationServiceEmployee,
  );

  const filterItems = [
    {
      key: "keyword",
      title: "tìm kiếm theo tên, mã nhân sự",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "role",
      title: "Vai trò",
      type: "multiSelect",
      className: "w-[230px]",
      options: [
        { label: "Role 1", value: "1" },
        { label: "Role 2", value: "2" },
      ],
    },
    {
      key: "department",
      title: "Phòng ban",
      type: "multiSelect",
      className: "w-[230px]",
      options: [
        { label: "Department 1", value: "1" },
        { label: "Department 2", value: "2" },
      ],
    },
  ] as FilterProps[];

  return (
    <div className={props?.className ?? ""}>
      <LTTFilter
        filterItems={filterItems}
        onChange={(allValues) => {
          dispatch(
            administrationServiceStore.employee.getEmployeeList({
              ...employeeList.input,
              ...allValues,
            }),
          );
        }}
      />
    </div>
  );
};

export default EmployeeFilter;
