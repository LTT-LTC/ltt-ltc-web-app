import LTTBadge from "@/src/@core/component/LTTBadge";
import { ActiveStatus } from "./ActiveStatus";

export const EmployeeStatusOptions = [
  { label: "Đang hoạt động", value: ActiveStatus.Active },
  { label: "Vô hiệu hóa", value: ActiveStatus.Deactive },
];

export const EmployeeStatusLabels = (employeeStatus: ActiveStatus) => {
  switch (employeeStatus) {
    case ActiveStatus.Active:
      return (
        <LTTBadge color="success" variant="solid">
          Đang hoạt động
        </LTTBadge>
      );
    case ActiveStatus.Deactive:
      return (
        <LTTBadge color="error" variant="solid">
          Vô hiệu hóa
        </LTTBadge>
      );
    default:
      return <></>;
  }
};
