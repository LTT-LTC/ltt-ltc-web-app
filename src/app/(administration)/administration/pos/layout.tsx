"use client";

import React from "react";
import LTTAdminSubDomainLayout from "@/src/@core/component/LTTAdminSubDomainLayout";
import { AdminRole } from "@/src/@core/type/permission.types";
import { posNavItems } from "@/src/@core/http/routes/administration";

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LTTAdminSubDomainLayout role={AdminRole.POS} navItems={posNavItems}>
      {children}
    </LTTAdminSubDomainLayout>
  );
}
