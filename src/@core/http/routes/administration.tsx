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
  Ticket as BookingIcon,
  History,
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
    key: "amenities",
    label: "Cinema Amenities",
    path: "/administration/admin/amenities",
    icon: Building2,
    permissionKey: "admin:amenities",
  },
  {
    key: "seat-types",
    label: "Seat Type",
    path: "/administration/admin/seat-types",
    icon: Grid3X3,
    permissionKey: "admin:seat-types",
  },
  {
    key: "movies",
    label: "Movie Distribution",
    path: "/administration/admin/movies",
    icon: Film,
    permissionKey: "admin:movies",
  },
  {
    key: "movie-metadata",
    label: "Movie Metadata",
    path: "/administration/admin/movie-metadata",
    icon: Grid3X3,
    permissionKey: "admin:movies",
  },
  {
    key: "customers",
    label: "Customer Management",
    path: "/administration/admin/customers",
    icon: Users,
    permissionKey: "admin:staff",
  },
  {
    key: "member-card-requests",
    label: "MemberCard Request",
    path: "/administration/admin/member-card-request",
    icon: Users,
    permissionKey: "admin:staff",
  },
  {
    key: "staff",
    label: "Staff & RBAC",
    path: "/administration/admin/staff",
    icon: Users,
    permissionKey: "admin:staff",
  },
  {
    key: "promotions",
    label: "Promotion & Giftcard",
    path: "/administration/admin/promotions",
    icon: Gift,
    permissionKey: "admin:promotions",
  },
  {
    key: "member-tier",
    label: "Member Tier",
    path: "/administration/admin/member-tier",
    icon: Grid3X3,
    permissionKey: "admin:promotions",
  },
  {
    key: "reports",
    label: "Revenue Report",
    path: "/administration/admin/reports",
    icon: BarChart3,
    permissionKey: "admin:reports",
  },
  {
    key: "bookings",
    label: "Booking Management",
    path: "/administration/admin/bookings",
    icon: BookingIcon,
    permissionKey: "admin:bookings",
  },
];

/** Navigation items for Tenant Manager sub-domain */
export const managerNavItems: NavItemConfig[] = [
  {
    key: "dashboard",
    label: "Executive Dashboard",
    path: "/administration/manager/dashboard",
    icon: LayoutDashboard,
    permissionKey: "manager:dashboard",
  },
  {
    key: "showtimes",
    label: "Showtime Scheduler",
    path: "/administration/manager/showtimes",
    icon: CalendarClock,
    permissionKey: "manager:showtimes",
  },
  {
    key: "screens",
    label: "Screens",
    path: "/administration/manager/screens",
    icon: Building2,
    permissionKey: "manager:screens",
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
    key: "news-and-offers",
    label: "News & Offers",
    path: "/administration/manager/news-and-offers",
    icon: Gift,
    permissionKey: "manager:news-and-offers",
  },
  {
    key: "promotions",
    label: "Promotion & Giftcard",
    path: "/administration/manager/promotions",
    icon: Gift,
    permissionKey: "manager:promotions",
  },
  {
    key: "pricing-rules",
    label: "Pricing Rules",
    path: "/administration/manager/pricing-rules",
    icon: Building2,
    permissionKey: "manager:screens",
  },
  {
    key: "reports",
    label: "Revenue Report",
    path: "/administration/manager/reports",
    icon: BarChart3,
    permissionKey: "manager:reports",
  },
  // {
  //   key: "crm",
  //   label: "CRM & Incident",
  //   path: "/administration/manager/crm",
  //   icon: HeadphonesIcon,
  //   permissionKey: "manager:crm",
  // },
  // {
  //   key: "refunds",
  //   label: "Refund Approval",
  //   path: "/administration/manager/refunds",
  //   icon: RotateCcw,
  //   permissionKey: "manager:refunds",
  // },x
  // {
  //   key: "bookings",
  //   label: "Booking Management",
  //   path: "/administration/manager/bookings",
  //   icon: BookingIcon,
  //   permissionKey: "manager:bookings",
  // },
];

/** Navigation items for Cinema Staff sub-domain (Currently unused, merged into Manager/Admin) */
export const staffNavItems: NavItemConfig[] = [
  {
    key: "dashboard",
    label: "Staff Dashboard",
    path: "/administration/staff/dashboard",
    icon: LayoutDashboard,
    permissionKey: "staff:dashboard",
  },
  {
    key: "booking-history",
    label: "Booking History",
    path: "/administration/staff/booking-history",
    icon: History,
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

