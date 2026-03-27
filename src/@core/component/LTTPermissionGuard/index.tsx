"use client";

import React from "react";
import { AdminRole } from "../../type/permission.types";
import { usePermissions } from "../../hooks/usePermissions";

interface LTTPermissionGuardProps {
  permissionKey: string;
  role?: AdminRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the user's permission.
 * If the user lacks the required permission, renders the fallback (or nothing).
 */
export default function LTTPermissionGuard({
  permissionKey,
  role = AdminRole.ADMIN,
  children,
  fallback = null,
}: LTTPermissionGuardProps) {
  const { hasPermission } = usePermissions(role);

  if (!hasPermission(permissionKey)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
