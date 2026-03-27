"use client";

import { useMemo } from "react";
import { AdminRole, type PermissionConfig } from "../type/permission.types";
import { DEFAULT_ROLE_PERMISSIONS } from "../const/permission.constants";

/**
 * Hook to get the permission config for a given role.
 * In the future, this will fetch overrides from the API.
 * For now, returns defaults from the permission matrix.
 *
 * @param role - The current user's admin role
 * @returns Permission config and helper function
 */
export function usePermissions(role: AdminRole = AdminRole.ADMIN) {
  const permissions: PermissionConfig = useMemo(() => {
    return DEFAULT_ROLE_PERMISSIONS[role] || {};
  }, [role]);

  const hasPermission = (key: string): boolean => {
    return permissions[key] === true;
  };

  return { permissions, hasPermission };
}
