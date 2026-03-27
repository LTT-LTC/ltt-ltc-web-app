/**
 * Permission types for the administration domain.
 * Supports hierarchical PBAC where parent roles configure child access.
 */

export enum AdminRole {
  ADMIN = "admin",
  MANAGER = "manager",
  STAFF = "staff",
  POS = "pos",
}

/** Hierarchy order — lower index = higher authority */
export const ROLE_HIERARCHY: AdminRole[] = [
  AdminRole.ADMIN,
  AdminRole.MANAGER,
  AdminRole.STAFF,
  AdminRole.POS,
];

export type PermissionKey = string;

export type PermissionConfig = Record<string, boolean>;

/** Full role-permission matrix: parent can configure child roles */
export type RolePermissions = Record<AdminRole, PermissionConfig>;

export interface NavItemConfig {
  key: string;
  label: string;
  path: string;
  permissionKey?: string;
}
