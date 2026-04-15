import { type NavItemConfig } from "../../type/permission.types";
import {
  LayoutDashboard,
  Building2,
  Film,
  CalendarClock,
  Grid3X3,
  Users,
  UtensilsCrossed,
  BarChart3,
  Gift,
  HeadphonesIcon,
  RotateCcw,
} from "lucide-react";

/** Navigation items for System Admin sub-domain */
export const adminNavItems: NavItemConfig[] = [
  {
    key: "dashboard",
    label: "Executive Dashboard",
    path: "/administration/admin/dashboard",
    icon: LayoutDashboard,
    permissionKey: "admin:dashboard",
  },
  {
    key: "cinema",
    label: "Cinema Configuration",
    path: "/administration/admin/cinema",
    icon: Building2,
    permissionKey: "admin:cinema",
  },
  {
    key: "movies",
    label: "Movie Distribution",
    path: "/administration/admin/movies",
    icon: Film,
    permissionKey: "admin:movies",
  },
  {
    key: "staff",
    label: "Staff & RBAC",
    path: "/administration/admin/staff",
    icon: Users,
    permissionKey: "admin:staff",
  },
  {
    key: "reports",
    label: "Revenue Report",
    path: "/administration/admin/reports",
    icon: BarChart3,
    permissionKey: "admin:reports",
  },
];

/** Navigation items for Tenant Manager sub-domain */
export const managerNavItems: NavItemConfig[] = [
  {
    key: "showtimes",
    label: "Showtime Scheduler",
    path: "/administration/manager/showtimes",
    icon: CalendarClock,
    permissionKey: "manager:showtimes",
  },
  {
    key: "seatmap",
    label: "Seat Map Editor",
    path: "/administration/manager/seatmap",
    icon: Grid3X3,
    permissionKey: "manager:seatmap",
  },
  {
    key: "seat-types",
    label: "Seat Type",
    path: "/administration/manager/seat-types",
    icon: Grid3X3,
    permissionKey: "manager:seat-types",
  },
  {
    key: "fnb",
    label: "F&B / Concessions",
    path: "/administration/manager/fnb",
    icon: UtensilsCrossed,
    permissionKey: "manager:fnb",
  },
  {
    key: "reports",
    label: "Revenue Report",
    path: "/administration/manager/reports",
    icon: BarChart3,
    permissionKey: "manager:reports",
  },
  {
    key: "promotions",
    label: "Promotion & Giftcard",
    path: "/administration/manager/promotions",
    icon: Gift,
    permissionKey: "manager:promotions",
  },
  {
    key: "crm",
    label: "CRM & Incident",
    path: "/administration/manager/crm",
    icon: HeadphonesIcon,
    permissionKey: "manager:crm",
  },
  {
    key: "refunds",
    label: "Refund Approval",
    path: "/administration/manager/refunds",
    icon: RotateCcw,
    permissionKey: "manager:refunds",
  },
];

/** Navigation items for Cinema Staff sub-domain (Currently unused, merged into Manager/Admin) */
export const staffNavItems: NavItemConfig[] = [
  {
    key: "dashboard",
    label: "Staff Dashboard",
    path: "/administration/staff/dashboard",
    icon: LayoutDashboard,
    permissionKey: "staff:dashboard",
  }
];

/** Navigation items for POS Machine sub-domain (Currently unused, merged into Manager/Admin) */
export const posNavItems: NavItemConfig[] = [
  {
    key: "dashboard",
    label: "POS",
    path: "/administration/pos/dashboard",
    icon: LayoutDashboard,
    permissionKey: "pos:dashboard",
  }
];

