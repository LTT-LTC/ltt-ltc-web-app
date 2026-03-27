"use client";

import React from "react";
import AppHeader from "@/src/layouts/AppHeader";
import { useSidebar } from "@/src/@core/provider/sidebar-provider";
import BackDrop from "@/src/layouts/BackDrop";

/**
 * Top-level layout for the (administration) route group.
 * Provides the shared header (notification bell, user dropdown)
 * and backdrop for all sub-domains.
 */
export default function AdministrationGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <BackDrop />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded || isHovered
            ? "lg:ml-[290px]"
            : "lg:ml-[90px]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
