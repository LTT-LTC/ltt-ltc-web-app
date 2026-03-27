"use client";

import React from "react";
import LTTAdminSubDomainLayout from "@/src/@core/component/LTTAdminSubDomainLayout";
import { AdminRole } from "@/src/@core/type/permission.types";
import { staffNavItems } from "@/src/@core/http/routes/administration";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LTTAdminSubDomainLayout role={AdminRole.STAFF} navItems={staffNavItems}>
      {children}
    </LTTAdminSubDomainLayout>
  );
}
