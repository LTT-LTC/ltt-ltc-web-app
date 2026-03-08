import GamePadIcon from "../../component/SWTIcon/iconoir/gamepad";
import GroupUserIcon from "../../component/SWTIcon/iconoir/group-user";
import LaptopFixIcon from "../../component/SWTIcon/iconoir/laptop-fix";
import MoneySquareIcon from "../../component/SWTIcon/iconoir/money-square";
import NetworkLeftIcon from "../../component/SWTIcon/iconoir/network-left";
import TaskListIcon from "../../component/SWTIcon/iconoir/task-list";
import TimerIcon from "../../component/SWTIcon/iconoir/timer";
import UserCartIcon from "../../component/SWTIcon/iconoir/user-cart";
import ViewGridIcon from "../../component/SWTIcon/iconoir/view-grid";
import QuestionMarkIcon from "../../component/SWTIcon/iconoir/question-mark"
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export type AppNavItems = {
  navItems: NavItem[];
  categoryName: string;
};

export const navItems: AppNavItems[] = [
  {
    categoryName: "DASHBOARD",
    navItems: [
      {
        icon: <ViewGridIcon variant="primary" />,
        name: "Quản lý Dashboard",
        subItems: [{ name: "Ecommerce", path: "/", pro: false }],
      },
    ],
  },
  {
    categoryName: "TỔ CHỨC",
    navItems: [
      {
        icon: <NetworkLeftIcon variant="primary" />,
        name: "Quản lý tổ chức",
        subItems: [{ name: "Danh sách tổ chức", path: "/organization", pro: false }],
      },
      {
        icon: <GroupUserIcon variant="primary" />,
        name: "Quản lý nhân sự",
        subItems: [{ name: "Danh sách nhân sự", path: "/employee", pro: false }],
      },
    ],
  },
  {
    categoryName: "SỬA MÁY",
    navItems: [
      {
        icon: <LaptopFixIcon variant="primary" />,
        name: "Quản lý sửa máy",
        subItems: [{ name: "Danh sách sửa máy", path: "/repair", pro: false }],
      },
    ],
  },
  {
    categoryName: "KHÁCH HÀNG",
    navItems: [
      {
        icon: <UserCartIcon variant="primary" />,
        name: "Quản lý khách hàng",
        subItems: [{ name: "Danh sách khách hàng", path: "/party", pro: false }],
      },
    ],
  },
  {
    categoryName: "CA TRỰC",
    navItems: [
      {
        icon: <TaskListIcon variant="primary" />,
        name: "Quản lý ca trực",
        subItems: [{ name: "Danh sách ca trực", path: "/shift", pro: false }],
      },
    ],
  },
  {
    categoryName: "ĐIỂM DANH",
    navItems: [
      {
        icon: <TimerIcon variant="primary" />,
        name: "Quản lý điểm danh",
        subItems: [{ name: "Danh sách điểm danh", path: "/attendance", pro: false }],
      },
    ],
  },
  {
    categoryName: "QUỸ",
    navItems: [
      {
        icon: <MoneySquareIcon variant="primary" />,
        name: "Quản lý quỹ",
        subItems: [{ name: "Danh sách quỹ", path: "/fund", pro: false }],
      },
    ],
  },
  {
    categoryName: "HOẠT ĐỘNG",
    navItems: [
      {
        icon: <GamePadIcon variant="primary" />,
        name: "Quản lý hoạt động",
        subItems: [{ name: "Danh sách hoạt động", path: "/activity", pro: false }],
      },
    ],
  },
  {
    categoryName: "HƯỚNG DẪN",
    navItems: [
      {
        icon: <QuestionMarkIcon variant="primary" />,
        name: "Hướng dẫn",
        subItems: [{ name: "Hướng dẫn", path: "/instructions", pro: false }],
      },
    ],
  },
];
