"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminRole } from "@/src/@core/type/permission.types";
import { adminNavItems, managerNavItems } from "@/src/@core/http/routes/administration";
import LTTAdminSubDomainLayout from "@/src/@core/component/LTTAdminSubDomainLayout";

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

  // If we are on the login page, don't show the layout
  if (pathname.includes("/login")) {
    return <>{children}</>;
  }

  const isAdmin = pathname.includes("/administration/admin");
  const role = isAdmin ? AdminRole.ADMIN : AdminRole.MANAGER;
  const navItems = isAdmin ? adminNavItems : managerNavItems;

  return (
    <LTTAdminSubDomainLayout role={role} navItems={navItems}>
      {children}
    </LTTAdminSubDomainLayout>
  );
}

