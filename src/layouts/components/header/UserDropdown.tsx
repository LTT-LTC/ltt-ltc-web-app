"use client";
import Link from "next/link";
import React, { useState } from "react";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import { Dropdown } from "@/src/@core/component/LTTDropdown/Dropdown";
import { DropdownItem } from "@/src/@core/component/LTTDropdown/DropdownItem";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { administrationService } from "@/src/services/administration-service/administration.service";
import { customerService } from "@/src/services/customer-service/customer.service";
import {
  ADMIN_ACCESS_TOKEN_KEY,
  ADMIN_REFRESH_TOKEN_KEY,
  CUSTOMER_ACCESS_TOKEN_KEY,
  CUSTOMER_REFRESH_TOKEN_KEY,
  TENANT_KEY
} from "@/src/@core/const";
import { getCookie, removeCookie } from "@/src/@core/utils/cookie";
import { getUserInfoFromToken, UserClaims } from "@/src/@core/utils/jwt";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const isAdminContext = typeof window !== 'undefined' && (
    window.location.pathname.startsWith("/administration") ||
    window.location.pathname.startsWith("/admin") ||
    window.location.pathname.startsWith("/employee") ||
    window.location.pathname.startsWith("/manager") ||
    window.location.pathname.startsWith("/staff") ||
    window.location.pathname.startsWith("/pos")
  );
  const accessToken = isAdminContext
    ? getCookie(ADMIN_ACCESS_TOKEN_KEY)
    : getCookie(CUSTOMER_ACCESS_TOKEN_KEY);
  const isLoggedIn = Boolean(accessToken);
  const userInfo: UserClaims | null = accessToken ? getUserInfoFromToken(accessToken) : null;

  const { mutation, isLoading } = useLTTMutation<boolean, void>({
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
    onSuccess: () => {
      handleLocalLogout();
    },
    onError: () => {
      // Even if the server call fails (e.g. 401), we should clear local state
      handleLocalLogout();
    }
  });

  const handleLocalLogout = () => {
    const isAdmin = isAdminContext;

    if (isAdmin) {
      localStorage.removeItem(TENANT_KEY);
      removeCookie(ADMIN_ACCESS_TOKEN_KEY);
      removeCookie(ADMIN_REFRESH_TOKEN_KEY);
      removeCookie(TENANT_KEY);
    } else {
      removeCookie(CUSTOMER_ACCESS_TOKEN_KEY);
      removeCookie(CUSTOMER_REFRESH_TOKEN_KEY);
    }

    if (isAdmin) {
      window.location.href = "/administration-login";
    } else {
      window.location.href = "/";
    }
  };

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const logOut = () => {
    if (isLoading) {
      return;
    }
    mutation();
  };

  // Extract real info or use placeholders
  const fullName = userInfo?.fullName || userInfo?.userName || "User";
  const email = userInfo?.email || "user@gmail.com";

  if (!isLoggedIn) {
    const isCustomer = typeof window !== 'undefined' && !window.location.pathname.startsWith("/administration");
    if (isCustomer) {
      return (
        <Link href="/customer-login" className="no-underline">
          <LTTButton
            variant="primary"
            className="flex items-center gap-2 px-4 py-2 font-bold text-sm tracking-widest bg-primary text-white transition-all duration-200 hover:scale-105 hover:!bg-primary hover:!text-white"
          >
            Login / Register
          </LTTButton>
        </Link>
      );
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle cursor-pointer border-none bg-transparent p-0 transition-opacity hover:opacity-80"
      >
        <span className="font-medium text-theme-sm">{fullName}</span>

        <svg
          className={`ml-2 stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          width="18"
          height="18"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark z-[1000]"
      >
        <div className="px-3 py-2">
          <span className="block font-bold text-gray-800 text-theme-sm dark:text-gray-100">
            {fullName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {email}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-y border-gray-100 dark:border-gray-800 m-0 p-0 list-none my-2">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/my-ltc/account-details"
              baseClassName="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 no-underline"
            >
              <span className="material-symbols-outlined text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">person</span>
              Thông tin cá nhân
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/my-ltc"
              baseClassName="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 no-underline"
            >
              <span className="material-symbols-outlined text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">dashboard</span>
              Dashboard của tôi
            </DropdownItem>
          </li>
        </ul>
        <LTTButton
          loading={isLoading}
          disabled={isLoading}
          onClick={logOut}
          className="!w-full !mt-1 !px-3 !py-2 !h-auto !border-none !shadow-none !bg-transparent !text-red-600 hover:!bg-red-50 hover:!text-red-700 !justify-start"
        >
          {!isLoading && (
            <span className="material-symbols-outlined text-red-500 group-hover:text-red-700">logout</span>
          )}
          Đăng xuất
        </LTTButton>
      </Dropdown>
    </div>
  );
}
