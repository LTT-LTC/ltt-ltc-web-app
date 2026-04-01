"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LTTCard from "../AntD/LTTCard";
import { AdminRole, type NavItemConfig } from "../../type/permission.types";
import { usePermissions } from "../../hooks/usePermissions";
import { useSidebar } from "../../provider/sidebar-provider";

interface LTTAdminSubDomainLayoutProps {
  role: AdminRole;
  navItems: NavItemConfig[];
  children: React.ReactNode;
}

/**
 * Shared layout for administration sub-domains.
 * Renders a sidebar with logo + permission-filtered navigation and the page content.
 */
export default function LTTAdminSubDomainLayout({
  role,
  navItems,
  children,
}: LTTAdminSubDomainLayoutProps) {
  const { hasPermission } = usePermissions(role);
  const { isMobileOpen } = useSidebar();
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.permissionKey || hasPermission(item.permissionKey)
  );

  const isTabActive = (path: string) => {
    return pathname === path || pathname === `${path}/` || pathname.startsWith(`${path}/`);
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 w-[290px]
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        <div className="py-3 flex justify-start">
          <Link href="/">
            <Image
              src="/images/main/app-logo.png"
              alt="Logo"
              width={132}
              height={20}
            />
          </Link>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar mt-2 pb-4">
          <LTTCard className="p-0 overflow-hidden shadow-sm h-full flex flex-col" styles={{ body: { padding: 0, flex: 1, display: "flex", flexDirection: "column" } }}>
            <nav className="flex flex-row md:flex-col overflow-x-auto custom-scrollbar">
              {filteredItems.map((item, index) => {
                const isActive = isTabActive(item.path);
                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    style={{ animationDelay: `${index * 40}ms` }}
                    className={`group relative px-6 py-4 whitespace-nowrap text-sm md:text-base border-l-4 md:border-l-4 md:border-b-0 border-b-4 transition-all duration-300 ease-out animate-[fadeInUp_0.35s_ease-out_forwards] ${isActive
                        ? "bg-[#cc3434] !text-white hover:!text-white focus:!text-white visited:!text-white border-[#cc3434] font-semibold shadow-sm"
                        : "text-gray-700 hover:bg-[#fff1f1] hover:text-[#cc3434] focus:text-[#cc3434] focus:outline-none [-webkit-tap-highlight-color:transparent] border-transparent"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </LTTCard>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 24, paddingTop: 16 }}>
        {children}
      </main>
    </div>
  );
}
