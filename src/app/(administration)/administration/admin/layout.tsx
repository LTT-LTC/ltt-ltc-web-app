"use client";

import React from "react";
import LTTAdminSubDomainLayout from "@/src/@core/component/LTTAdminSubDomainLayout";
import { AdminRole } from "@/src/@core/type/permission.types";
import { adminNavItems } from "@/src/@core/http/routes/administration";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LTTAdminSubDomainLayout role={AdminRole.ADMIN} navItems={adminNavItems}>
      {children}
    </LTTAdminSubDomainLayout>
  );
}
