import { type NavItemConfig } from "../../type/permission.types";

/** Navigation items for System Admin sub-domain */
export const adminNavItems: NavItemConfig[] = [
    {
        key: "dashboard",
        label: "admin.menu.dashboard",
        path: "/administration/admin/dashboard",
        permissionKey: "admin:dashboard"
    },
    {
        key: "tenants",
        label: "admin.menu.tenant_management",
        path: "/administration/admin/tenants",
        permissionKey: "admin:tenants"
    },
    {
        key: "service-packages",
        label: "admin.menu.service_packages",
        path: "/administration/admin/service-packages",
        permissionKey: "admin:service-packages"
    },
    {
        key: "cinema",
        label: "admin.menu.cinema",
        path: "/administration/admin/cinema",
        permissionKey: "admin:cinema"
    },
    {
        key: "movies",
        label: "admin.menu.movies",
        path: "/administration/admin/movies",
        permissionKey: "admin:movies"
    },
    {
        key: "showtimes",
        label: "admin.menu.showtimes",
        path: "/administration/admin/showtimes",
        permissionKey: "admin:showtimes"
    },
    {
        key: "seatmap",
        label: "admin.menu.seat_map",
        path: "/administration/admin/seatmap",
        permissionKey: "admin:seatmap"
    },
    {
        key: "staff",
        label: "admin.menu.staff",
        path: "/administration/admin/staff",
        permissionKey: "admin:staff"
    },
    {
        key: "fnb",
        label: "admin.menu.fnb",
        path: "/administration/admin/fnb",
        permissionKey: "admin:fnb"
    },
    {
        key: "reports",
        label: "admin.menu.reports",
        path: "/administration/admin/reports",
        permissionKey: "admin:reports"
    },
    {
        key: "promotions",
        label: "admin.menu.promotions",
        path: "/administration/admin/promotions",
        permissionKey: "admin:promotions"
    },
    {
        key: "crm",
        label: "admin.menu.crm",
        path: "/administration/admin/crm",
        permissionKey: "admin:crm"
    },
    {
        key: "incident",
        label: "admin.menu.incidents",
        path: "/administration/admin/incident",
        permissionKey: "admin:incident"
    },
    {
        key: "refunds",
        label: "admin.menu.refunds",
        path: "/administration/admin/refunds",
        permissionKey: "admin:refunds"
    },
    {
        key: "settings",
        label: "admin.menu.settings",
        path: "/administration/admin/settings",
        permissionKey: "admin:settings"
    },
];

/** Navigation items for Tenant Manager sub-domain */
export const managerNavItems: NavItemConfig[] = [
    {
        key: "dashboard",
        label: "admin.menu.executive_dashboard",
        path: "/administration/manager/dashboard",
        permissionKey: "manager:dashboard"
    },
    {
        key: "cinema",
        label: "admin.menu.cinema_configuration",
        path: "/administration/manager/cinema",
        permissionKey: "manager:cinema"
    },
    {
        key: "movies",
        label: "admin.menu.movies_and_showtimes",
        path: "/administration/manager/movies",
        permissionKey: "manager:movies"
    },
    {
        key: "showtimes",
        label: "admin.menu.showtime_scheduler",
        path: "/administration/manager/showtimes",
        permissionKey: "manager:showtimes"
    },
    {
        key: "seatmap",
        label: "admin.menu.seat_map_editor",
        path: "/administration/manager/seatmap",
        permissionKey: "manager:seatmap"
    },
    {
        key: "staff",
        label: "admin.menu.staff_and_rbac",
        path: "/administration/manager/staff",
        permissionKey: "manager:staff"
    },
    {
        key: "fnb",
        label: "admin.menu.fnb_and_concessions",
        path: "/administration/manager/fnb",
        permissionKey: "manager:fnb"
    },
    {
        key: "reports",
        label: "admin.menu.revenue_reports",
        path: "/administration/manager/reports",
        permissionKey: "manager:reports"
    },
    {
        key: "promotions", label: "admin.menu.promotions_and_gift_cards", path: "/administration/manager/promotions", permissionKey: "manager:promotions"
    },
    {
        key: "crm", label: "admin.menu.crm_and_incidents", path: "/administration/manager/crm", permissionKey: "manager:crm"
    },
    {
        key: "refunds", label: "admin.menu.refund_approval", path: "/administration/manager/refunds", permissionKey: "manager:refunds"
    },
];

/** Navigation items for Cinema Staff sub-domain */
export const staffNavItems: NavItemConfig[] = [
    {
        key: "dashboard",
        label: "admin.menu.my_dashboard",
        path: "/administration/staff/dashboard",
        permissionKey: "staff:dashboard"
    },
    {
        key: "ticket-sales",
        label: "admin.menu.ticket_sales",
        path: "/administration/staff/ticket-sales",
        permissionKey: "staff:ticket-sales"
    },
    {
        key: "qr-checkin",
        label: "admin.menu.qr_checkin",
        path: "/administration/staff/qr-checkin",
        permissionKey: "staff:qr-checkin"
    },
    {
        key: "my-transactions",
        label: "admin.menu.my_transactions",
        path: "/administration/staff/my-transactions",
        permissionKey: "staff:my-transactions"
    },
    {
        key: "shift-report",
        label: "admin.menu.shift_report",
        path: "/administration/staff/shift-report",
        permissionKey: "staff:shift-report"
    },
];

/** Navigation items for POS Machine sub-domain */
export const posNavItems: NavItemConfig[] = [
    {
        key: "ticket-sales",
        label: "admin.menu.ticket_sales",
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
