import { AdminRole, type PermissionConfig } from "@/src/@core/type/permission.types";
import { DEFAULT_ROLE_PERMISSIONS } from "@/src/@core/const/permission.constants";

const fetchPermissions = async (role: AdminRole): Promise<PermissionConfig> => {
  // Stub: return defaults. Replace with API call when backend is ready.
  return DEFAULT_ROLE_PERMISSIONS[role] || {};
};

const updateChildPermissions = async (
  _parentRole: AdminRole,
  _childRole: AdminRole,
  _overrides: Partial<PermissionConfig>
): Promise<void> => {
  // Stub: will POST to backend to save parent's overrides for child role
  return;
};

export const permissionsService = {
  fetchPermissionsAsync: fetchPermissions,
  updateChildPermissionsAsync: updateChildPermissions,
  fetchPermissions,
  updateChildPermissions,
};
