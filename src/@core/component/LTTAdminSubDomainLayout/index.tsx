"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Globe,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { AdminRole, type NavItemConfig } from "../../type/permission.types";
import { usePermissions } from "../../hooks/usePermissions";
import { cn } from "@/src/@core/utils/cn";

import { useLocalization } from "../../hooks/use-localization";
import { getUserInfoFromToken, UserClaims } from "../../utils/jwt";
import { getCookie, removeCookie } from "../../utils/cookie";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TENANT_KEY } from "../../const";
import useLTTMutation from "../../hooks/useLTTMutation";
import { administrationService } from "@/src/services/administration-service/administration.service";
import { customerService } from "@/src/services/customer-service/customer.service";
import { Dropdown } from "../LTTDropdown/Dropdown";
import { DropdownItem } from "../LTTDropdown/DropdownItem";
import { LTTToaster } from "../LTTShadcnUI/LTTSonner";

interface LTTAdminSubDomainLayoutProps {
  role: AdminRole;
  navItems: NavItemConfig[];
  children: React.ReactNode;
}

export default function LTTAdminSubDomainLayout({
  role,
  navItems,
  children,
}: LTTAdminSubDomainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { hasPermission } = usePermissions(role);
  const pathname = usePathname();

  // Language Logic
  const { currentLanguage, changeLanguage, t } = useLocalization();
  const isEN = currentLanguage.toUpperCase() === "EN";
  const isVI = currentLanguage.toUpperCase() === "VI";

  // Notification Logic
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // User Logic
  const [isUserOpen, setIsUserOpen] = useState(false);
  const accessToken = getCookie(ACCESS_TOKEN_KEY);
  const userInfo: UserClaims | null = accessToken ? getUserInfoFromToken(accessToken) : null;

  const { mutation: logOut, isLoading: isLoggingOut } = useLTTMutation<boolean, void>({
    mutationFn: () => {
      const isAdmin = typeof window !== 'undefined' && (
        window.location.pathname.startsWith("/administration") ||
        window.location.pathname.startsWith("/admin") ||
        window.location.pathname.startsWith("/employee") ||
        window.location.pathname.startsWith("/manager") ||
        window.location.pathname.startsWith("/staff") ||
        window.location.pathname.startsWith("/pos")
      );
      if (isAdmin) {
        return administrationService.authService.logOutAsync({});
      } else {
        return customerService.authService.logOutAsync({});
      }
    },
    onSuccess: () => handleLocalLogout(),
    onError: () => handleLocalLogout()
  });

  const handleLocalLogout = () => {
    const isAdmin = typeof window !== 'undefined' && (
      window.location.pathname.startsWith("/administration") ||
      window.location.pathname.startsWith("/admin") ||
      window.location.pathname.startsWith("/employee") ||
      window.location.pathname.startsWith("/manager") ||
      window.location.pathname.startsWith("/staff") ||
      window.location.pathname.startsWith("/pos")
    );

    localStorage.removeItem("user_info");
    localStorage.removeItem(TENANT_KEY);
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
    removeCookie(TENANT_KEY);

    if (isAdmin) {
      window.location.href = "/administration-login";
    } else {
      window.location.href = "/";
    }
  };

  const fullName = userInfo?.fullName || userInfo?.userName || "User";
  const email = userInfo?.email || "user@gmail.com";
  const abbreviation = fullName.substring(0, 3).toUpperCase();

  const filteredItems = navItems.filter(
    (item) => !item.permissionKey || hasPermission(item.permissionKey)
  );

  const currentNav = navItems.find((item) => pathname === item.path || pathname.startsWith(item.path));
  const breadcrumbLabel = currentNav?.label || "Dashboard";

  const isActivePath = (path: string) => {
    return pathname === path || pathname === `${path}/` || pathname.startsWith(`${path}/`);
  };

  return (

    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border-shadcn bg-card transition-all duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-border-shadcn px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-shadcn">
            <span className="font-heading text-lg font-bold text-primary-shadcn">LTC</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {filteredItems.map((item) => {
            const isActive = isActivePath(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.path}
                className={cn(
                  "mx-2 my-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-shadcn text-primary-shadcn-foreground shadow-sm"
                    : "text-foreground/70 hover:bg-muted-shadcn hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-10 items-center justify-center border-t border-border-shadcn text-muted-foreground-shadcn hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className={cn("flex flex-1 flex-col transition-all duration-200", collapsed ? "ml-16" : "ml-64")}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border-shadcn bg-white dark:bg-gray-900 px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground-shadcn">
            <span>Administration</span>
            <span>/</span>
            <span className="text-foreground">{breadcrumbLabel}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Logic */}
            <div className="flex items-center gap-1 rounded-full border border-border-shadcn p-0.5">
              <Globe className="ml-1.5 h-4 w-4 text-muted-foreground-shadcn" />
              <button
                onClick={() => changeLanguage('vi')}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                  isVI ? "bg-primary-shadcn text-primary-shadcn-foreground" : "text-muted-foreground-shadcn hover:text-foreground"
                )}
              >
                VI
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                  isEN ? "bg-primary-shadcn text-primary-shadcn-foreground" : "text-muted-foreground-shadcn hover:text-foreground"
                )}
              >
                EN
              </button>
            </div>

            {/* Notification Logic */}
            <div className="relative">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="dropdown-toggle outline-none flex items-center justify-center">
                <Bell className="h-5 w-5 text-muted-foreground-shadcn cursor-pointer hover:text-foreground" />
              </button>
              <Dropdown
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                className="absolute right-0 mt-4 flex h-[480px] w-[350px] flex-col rounded-2xl border border-border-shadcn bg-card p-3 shadow-md sm:w-[361px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-shadcn">
                  <h5 className="text-lg font-semibold text-foreground">
                    {t("admin.menu.notification") || "Notification"}
                  </h5>
                </div>
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground-shadcn">No notifications</p>
                </div>
              </Dropdown>
            </div>

            {/* User Logic */}
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer dropdown-toggle"
                onClick={() => setIsUserOpen(!isUserOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-muted-shadcn flex items-center justify-center text-xs font-bold text-primary-shadcn">{abbreviation}</div>
                <span className="text-sm font-medium">{fullName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground-shadcn" />
              </div>

              <Dropdown
                isOpen={isUserOpen}
                onClose={() => setIsUserOpen(false)}
                className="absolute right-0 mt-4 flex w-[260px] flex-col rounded-2xl border border-border-shadcn bg-card p-3 shadow-md"
              >
                <div className="px-3 py-2">
                  <span className="block font-bold text-foreground text-sm">
                    {fullName}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground-shadcn">
                    {email}
                  </span>
                </div>

                <ul className="flex flex-col gap-1 pt-4 pb-3 border-y border-border-shadcn m-0 p-0 list-none my-2">
                  <li>
                    <DropdownItem
                      onItemClick={() => setIsUserOpen(false)}
                      tag="a"
                      href="/my-ltc/account-details"
                      baseClassName="flex items-center gap-3 px-3 py-2 font-medium text-foreground rounded-lg hover:bg-muted-shadcn text-sm no-underline"
                    >
                      Thông tin cá nhân
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem
                      onItemClick={() => setIsUserOpen(false)}
                      tag="a"
                      href="/my-ltc"
                      baseClassName="flex items-center gap-3 px-3 py-2 font-medium text-foreground rounded-lg hover:bg-muted-shadcn text-sm no-underline"
                    >
                      Cài đặt tài khoản
                    </DropdownItem>
                  </li>
                </ul>
                <button
                  onClick={() => {
                    setIsUserOpen(false);
                    if (!isLoggingOut) logOut();
                  }}
                  className="flex items-center gap-3 px-3 py-2 font-medium text-foreground rounded-lg hover:bg-muted-shadcn text-sm text-left outline-none w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </Dropdown>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="animate-fade-in-up">{children}</div>
        </main>
      </div>
      <LTTToaster />
    </div>
  );
}
