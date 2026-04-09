"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminRole } from "@/src/@core/type/permission.types";
import { adminNavItems, managerNavItems } from "@/src/@core/http/routes/administration";
import LTTAdminSubDomainLayout from "@/src/@core/component/LTTAdminSubDomainLayout";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/src/@core/const";
import { getCookie, removeCookie } from "@/src/@core/utils/cookie";
import {
  getAdminHomePathByRole,
  isAdminPathAllowedForRole,
  resolveAdminRoleFromToken,
} from "@/src/@core/utils/admin-auth";

/**
 * Top-level layout for the (administration) route group.
 * Provides the shared header and sidebar dynamically based on path.
 */
export default function AdministrationGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLoginPath = pathname.includes("/login");
  const accessToken = getCookie(ACCESS_TOKEN_KEY);
  const role = resolveAdminRoleFromToken(accessToken);

  useEffect(() => {
    if (isLoginPath) {
      return;
    }

    if (!accessToken) {
      window.location.href = "/administration-login";
      return;
    }

    if (!role) {
      removeCookie(ACCESS_TOKEN_KEY);
      removeCookie(REFRESH_TOKEN_KEY);
      window.location.href = "/administration-login";
      return;
    }

    if (!isAdminPathAllowedForRole(pathname, role)) {
      window.location.href = getAdminHomePathByRole(role);
      return;
    }
  }, [accessToken, isLoginPath, pathname, role]);

  // If we are on the login page, don't show the layout
  if (isLoginPath) {
    return <>{children}</>;
  }

  if (!role) {
    return null;
  }

  const navItems = role === AdminRole.ADMIN ? adminNavItems : managerNavItems;

  return (
    <LTTAdminSubDomainLayout role={role} navItems={navItems}>
      {children}
    </LTTAdminSubDomainLayout>
  );
}

