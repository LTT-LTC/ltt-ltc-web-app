import { AdminRole, type PermissionConfig, type RolePermissions } from "../type/permission.types";

/**
 * Default permission matrix per role.
 * Admin has full access; each child role gets progressively fewer defaults.
 * Parent roles can override child permissions via API in the future.
 */

const ALL_PERMISSIONS: PermissionConfig = {
  // Admin-specific
  "admin:dashboard": true,
  "admin:tenants": true,
  "admin:service-packages": true,
  "admin:settings": true,
  "admin:cinema": true,
  "admin:movies": true,
  "admin:showtimes": true,
  "admin:seatmap": true,
  "admin:staff": true,
  "admin:fnb": true,
  "admin:reports": true,
  "admin:promotions": true,
  "admin:crm": true,
  "admin:incident": true,
  "admin:refunds": true,

  // Manager-specific
  "manager:dashboard": true,
  "manager:cinema": true,
  "manager:movies": true,
  "manager:showtimes": true,
  "manager:seatmap": true,
  "manager:staff": true,
  "manager:fnb": true,
  "manager:reports": true,
  "manager:promotions": true,
  "manager:crm": true,
  "manager:refunds": true,

  // Staff-specific
  "staff:dashboard": true,
  "staff:ticket-sales": true,
  "staff:qr-checkin": true,
  "staff:my-transactions": true,
  "staff:shift-report": true,

  // POS-specific
  "pos:ticket-sales": true,
  "pos:fnb-sales": true,
  "pos:qr-checkin": true,
  "pos:shift-close": true,
};

const MANAGER_PERMISSIONS: PermissionConfig = {
  ...Object.fromEntries(
    Object.keys(ALL_PERMISSIONS).map((key) => [key, false])
  ),
  "manager:dashboard": true,
  "manager:cinema": true,
  "manager:movies": true,
  "manager:showtimes": true,
  "manager:seatmap": true,
  "manager:staff": true,
  "manager:fnb": true,
  "manager:reports": true,
  "manager:promotions": true,
  "manager:crm": true,
  "manager:refunds": true,
  // Manager can also access staff and POS features
  "staff:dashboard": true,
  "staff:ticket-sales": true,
  "staff:qr-checkin": true,
  "staff:my-transactions": true,
  "staff:shift-report": true,
  "pos:ticket-sales": true,
  "pos:fnb-sales": true,
  "pos:qr-checkin": true,
  "pos:shift-close": true,
};

const STAFF_PERMISSIONS: PermissionConfig = {
  ...Object.fromEntries(
    Object.keys(ALL_PERMISSIONS).map((key) => [key, false])
  ),
  "staff:dashboard": true,
  "staff:ticket-sales": true,
  "staff:qr-checkin": true,
  "staff:my-transactions": true,
  "staff:shift-report": true,
};

const POS_PERMISSIONS: PermissionConfig = {
  ...Object.fromEntries(
    Object.keys(ALL_PERMISSIONS).map((key) => [key, false])
  ),
  "pos:ticket-sales": true,
  "pos:fnb-sales": true,
  "pos:qr-checkin": true,
  "pos:shift-close": true,
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  [AdminRole.ADMIN]: ALL_PERMISSIONS,
  [AdminRole.MANAGER]: MANAGER_PERMISSIONS,
  [AdminRole.STAFF]: STAFF_PERMISSIONS,
  [AdminRole.POS]: POS_PERMISSIONS,
};
