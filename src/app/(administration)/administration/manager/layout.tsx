"use client";

import React from "react";
import LTTAdminSubDomainLayout from "@/src/@core/component/LTTAdminSubDomainLayout";
import { AdminRole } from "@/src/@core/type/permission.types";
import { managerNavItems } from "@/src/@core/http/routes/administration";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LTTAdminSubDomainLayout role={AdminRole.MANAGER} navItems={managerNavItems}>
      {children}
    </LTTAdminSubDomainLayout>
  );
}
