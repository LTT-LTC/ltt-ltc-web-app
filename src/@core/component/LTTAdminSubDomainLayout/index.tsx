"use client";

import React from "react";
import { Menu } from "antd";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.permissionKey || hasPermission(item.permissionKey)
  );

  const activeKey =
    filteredItems.find((item) => pathname?.startsWith(item.path))?.key ||
    filteredItems[0]?.key;

  const menuItems = filteredItems.map((item) => ({
    key: item.key,
    label: item.label,
  }));

  const isOpen = isExpanded || isMobileOpen || isHovered;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
          ${
            isOpen
              ? "w-[290px]"
              : "w-[90px]"
          }
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`py-3 flex ${
            !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
        >
          <Link href="/">
            <Image
              src="/images/main/app-logo.png"
              alt="Logo"
              width={132}
              height={20}
            />
          </Link>
        </div>

        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar mt-2">
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={isOpen ? menuItems : menuItems.map((m) => ({ ...m, label: undefined }))}
            onClick={({ key }) => {
              const item = filteredItems.find((i) => i.key === key);
              if (item) router.push(item.path);
            }}
            style={{ borderRight: 0 }}
          />
        </div>
      </aside>

      <main style={{ flex: 1, padding: 24, paddingTop: 16 }}>
        {children}
      </main>
    </div>
  );
}
