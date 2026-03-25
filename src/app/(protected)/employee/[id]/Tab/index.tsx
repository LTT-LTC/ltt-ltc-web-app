import LTTTabs, { LTTPrefixProps, LTTTabItemsProps } from "@/src/@core/component/AntD/LTTTabs";
import EmployeeDetailProfileTab from "./Detail";
import UserIcon from "@/src/@core/component/LTTIcon/iconoir/user";
import BagIcon from "@/src/@core/component/LTTIcon/iconoir/bag";
import NotesIcon from "@/src/@core/component/LTTIcon/iconoir/notes";
import LaptopFixIcon from "@/src/@core/component/LTTIcon/iconoir/laptop-fix";
import DutyTab from "./Duty";
import AttendanceTab from "./Attendance";
import FixTab from "./Fix";

const EmployeeDetailTab = () => {
  const items = [
    {
      key: "1",
      label: "Thông tin cá nhân",
      prefix: {
        icon: <UserIcon variant="primary" />,
      } as LTTPrefixProps,
      children: <EmployeeDetailProfileTab />,
    },
    {
      key: "2",
      label: "Lịch trực",
      prefix: {
        icon: <BagIcon variant="primary" />,
      } as LTTPrefixProps,
      children: <DutyTab />,
    },
    {
      key: "3",
      label: "Lịch sử điểm danh",
      prefix: {
        icon: <NotesIcon variant="primary" />,
      } as LTTPrefixProps,
      children: <AttendanceTab />,
    },
    {
      key: "4",
      label: "Lịch sử sửa máy",
      prefix: {
        icon: <LaptopFixIcon variant="primary" />,
      } as LTTPrefixProps,
      children: <FixTab />,
    },
  ] as LTTTabItemsProps;

  return (
    <LTTTabs defaultActiveKey="1" items={items} />
  );
};

export default EmployeeDetailTab;
