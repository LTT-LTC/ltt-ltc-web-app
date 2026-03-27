import { AdminRole, type PermissionConfig } from "@/src/@core/type/permission.types";
import { DEFAULT_ROLE_PERMISSIONS } from "@/src/@core/const/permission.constants";

/**
 * Permissions service — thin API layer.
 * Currently returns default permissions. In the future, will fetch
 * role overrides from the backend so parents can configure child access.
 */

export async function fetchPermissions(role: AdminRole): Promise<PermissionConfig> {
  // Stub: return defaults. Replace with API call when backend is ready.
  return DEFAULT_ROLE_PERMISSIONS[role] || {};
}

export async function updateChildPermissions(
  _parentRole: AdminRole,
  _childRole: AdminRole,
  _overrides: Partial<PermissionConfig>
): Promise<void> {
  // Stub: will POST to backend to save parent's overrides for child role
  return;
}
