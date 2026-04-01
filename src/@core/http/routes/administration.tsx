import { type NavItemConfig } from "../../type/permission.types";

/** Navigation items for System Admin sub-domain */
export const adminNavItems: NavItemConfig[] = [
    {
        key: "dashboard",
        label: "Dashboard",
        path: "/administration/admin/dashboard",
        permissionKey: "admin:dashboard"
    },
    {
        key: "tenants",
        label: "Tenant Management",
        path: "/administration/admin/tenants",
        permissionKey: "admin:tenants"
    },
    {
        key: "service-packages",
        label: "Service Packages",
        path: "/administration/admin/service-packages",
        permissionKey: "admin:service-packages"
    },
    {
        key: "cinema",
        label: "Cinema",
        path: "/administration/admin/cinema",
        permissionKey: "admin:cinema"
    },
    {
        key: "movies",
        label: "Movies",
        path: "/administration/admin/movies",
        permissionKey: "admin:movies"
    },
    {
        key: "showtimes",
        label: "Showtimes",
        path: "/administration/admin/showtimes",
        permissionKey: "admin:showtimes"
    },
    {
        key: "seatmap",
        label: "Seat Map",
        path: "/administration/admin/seatmap",
        permissionKey: "admin:seatmap"
    },
    {
        key: "staff",
        label: "Staff",
        path: "/administration/admin/staff",
        permissionKey: "admin:staff"
    },
    {
        key: "fnb",
        label: "F&B",
        path: "/administration/admin/fnb",
        permissionKey: "admin:fnb"
    },
    {
        key: "reports",
        label: "Reports",
        path: "/administration/admin/reports",
        permissionKey: "admin:reports"
    },
    {
        key: "promotions",
        label: "Promotions",
        path: "/administration/admin/promotions",
        permissionKey: "admin:promotions"
    },
    {
        key: "crm",
        label: "CRM",
        path: "/administration/admin/crm",
        permissionKey: "admin:crm"
    },
    {
        key: "incident",
        label: "Incidents",
        path: "/administration/admin/incident",
        permissionKey: "admin:incident"
    },
    {
        key: "refunds",
        label: "Refunds",
        path: "/administration/admin/refunds",
        permissionKey: "admin:refunds"
    },
    {
        key: "settings",
        label: "Settings",
        path: "/administration/admin/settings",
        permissionKey: "admin:settings"
    },
];

/** Navigation items for Tenant Manager sub-domain */
export const managerNavItems: NavItemConfig[] = [
    {
        key: "dashboard",
        label: "Executive Dashboard",
        path: "/administration/manager/dashboard",
        permissionKey: "manager:dashboard"
    },
    {
        key: "cinema",
        label: "Cinema Configuration",
        path: "/administration/manager/cinema",
        permissionKey: "manager:cinema" },
    {
        key: "movies",
        label: "Movies & Showtimes",
        path: "/administration/manager/movies",
        permissionKey: "manager:movies" },
    {
        key: "showtimes",
        label: "Showtime Scheduler",
        path: "/administration/manager/showtimes",
        permissionKey: "manager:showtimes" },
    {
        key: "seatmap",
        label: "Seat Map Editor",
        path: "/administration/manager/seatmap",
        permissionKey: "manager:seatmap" },
    {
        key: "staff",
        label: "Staff & RBAC",
        path: "/administration/manager/staff",
        permissionKey: "manager:staff" },
    {
        key: "fnb",
        label: "F&B / Concessions",
        path: "/administration/manager/fnb",
        permissionKey: "manager:fnb" },
    {
        key: "reports",
        label: "Revenue Reports",
        path: "/administration/manager/reports",
        permissionKey: "manager:reports" },
    {
        key: "promotions", label: "Promotions & Gift Cards", path: "/administration/manager/promotions", permissionKey: "manager:promotions" },
    {
        key: "crm", label: "CRM & Incidents", path: "/administration/manager/crm", permissionKey: "manager:crm" },
    {
        key: "refunds", label: "Refund Approval", path: "/administration/manager/refunds", permissionKey: "manager:refunds" },
];

/** Navigation items for Cinema Staff sub-domain */
export const staffNavItems: NavItemConfig[] = [
    {
        key: "dashboard",
        label: "My Dashboard",
        path: "/administration/staff/dashboard",
        permissionKey: "staff:dashboard" },
    {
        key: "ticket-sales",
        label: "Ticket Sales",
        path: "/administration/staff/ticket-sales",
        permissionKey: "staff:ticket-sales" },
    {
        key: "qr-checkin",
        label: "QR Check-in",
        path: "/administration/staff/qr-checkin",
        permissionKey: "staff:qr-checkin" },
    {
        key: "my-transactions",
        label: "My Transactions",
        path: "/administration/staff/my-transactions",
        permissionKey: "staff:my-transactions" },
    {
        key: "shift-report",
        label: "Shift Report",
        path: "/administration/staff/shift-report",
        permissionKey: "staff:shift-report" },
];

/** Navigation items for POS Machine sub-domain */
export const posNavItems: NavItemConfig[] = [
    {
        key: "ticket-sales",
        label: "Ticket Sales",
        path: "/administration/pos/ticket-sales",
        permissionKey: "pos:ticket-sales"
    },
    {
        key: "fnb-sales",
        label: "F&B Sales",
        path: "/administration/pos/fnb-sales",
        permissionKey: "pos:fnb-sales"
    },
    {
        key: "qr-checkin",
        label: "QR Check-in",
        path: "/administration/pos/qr-checkin",
        permissionKey: "pos:qr-checkin"
    },
    {
        key: "shift-close",
        label: "Shift Close",
        path: "/administration/pos/shift-close",
        permissionKey: "pos:shift-close"
    },
];
