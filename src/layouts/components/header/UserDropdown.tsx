"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Dropdown } from "@/src/@core/component/LTTDropdown/Dropdown";
import { DropdownItem } from "@/src/@core/component/LTTDropdown/DropdownItem";
import useLTTMutation from "@/src/@core/hooks/useLTTMutation";
import { administrationService } from "@/src/services/administration-service/administration.service";
import { customerService } from "@/src/services/customer-service/customer.service";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TENANT_KEY } from "@/src/@core/const";
import { getCookie, removeCookie } from "@/src/@core/utils/cookie";
import { getUserInfoFromToken, UserClaims } from "@/src/@core/utils/jwt";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserClaims | null>(null);

  useEffect(() => {
    const accessToken = getCookie(ACCESS_TOKEN_KEY);
    if (accessToken) {
      setIsLoggedIn(true);
      setUserInfo(getUserInfoFromToken(accessToken));
    } else {
        setIsLoggedIn(false);
        setUserInfo(null);
    }
  }, []);

  const { mutation } = useLTTMutation<boolean, void>({
    mutationFn: () => {
      const isAdmin = typeof window !== 'undefined' && (
        window.location.pathname.startsWith("/admin") || 
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
    onSuccess: (res) => {
      handleLocalLogout();
    },
    onError: () => {
      // Even if the server call fails (e.g. 401), we should clear local state
      handleLocalLogout();
    }
  });

  const handleLocalLogout = () => {
    const isAdmin = typeof window !== 'undefined' && (
      window.location.pathname.startsWith("/admin") || 
      window.location.pathname.startsWith("/manager") || 
      window.location.pathname.startsWith("/staff") || 
      window.location.pathname.startsWith("/pos")
    );

    localStorage.removeItem(TENANT_KEY);
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
    
    if (isAdmin) {
      window.location.href = "/signin/";
    } else {
      window.location.href = "/customer-login/";
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
    mutation();
  };

  // Extract real info or use placeholders
  const fullName = userInfo?.fullName || userInfo?.userName || "Người dùng";
  const email = userInfo?.email || "datta@gmail.com";

  if (!isLoggedIn) {
     const isCustomer = typeof window !== 'undefined' && !window.location.pathname.includes("/(administration)");
     if (isCustomer) {
       return (
         <Link href="/customer-login" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 font-bold text-sm tracking-widest no-underline">
            Login / Register
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
          className={`ml-2 stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
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
        <div
          onClick={logOut}
          className="cursor-pointer flex items-center gap-3 px-3 py-2 mt-1 font-medium text-red-600 rounded-lg group text-theme-sm hover:bg-red-50 transition-colors"
        >
          <span className="material-symbols-outlined text-red-500 group-hover:text-red-700">logout</span>
          Đăng xuất
        </div>
      </Dropdown>
    </div>
  );
}
