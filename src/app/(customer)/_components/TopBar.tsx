"use client";
import React, { useState } from "react";
import Link from "next/link";
// import LTTSwitch from "@/src/@core/component/AntD/LTTSwitch";
import LTTLanguageSwitch from "@/src/@core/component/LTTLanguageSwitch";
import { getCookie } from "@/src/@core/utils/cookie";
import { ACCESS_TOKEN_KEY } from "@/src/@core/const";

const TopBar: React.FC = () => {
    // const [isVi, setIsVi] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const accessToken = getCookie(ACCESS_TOKEN_KEY);
    setIsLoggedIn(!!accessToken);
  }, []);

  return (
    <div className="bg-primary text-white py-2 border-b border-white/10">
      <div className="w-[92%] lg:w-[70%] mx-auto flex justify-end items-center gap-3 sm:gap-6 text-xs font-medium overflow-x-auto">
        <Link href="#" className="hover:text-white/60 transition-colors flex items-center gap-1 whitespace-nowrap lg:mx-0">
          <span className="material-symbols-outlined text-[16px]">campaign</span> <span className="hidden sm:inline">News and Offers</span>
        </Link>
        <Link href="/my-ltc/transaction-history" className="hover:text-white/60 transition-colors flex items-center gap-1 whitespace-nowrap lg:mx-0">
          <span className="material-symbols-outlined text-[16px]">confirmation_number</span> <span className="hidden sm:inline">My Ticket</span>
        </Link>
        {isLoggedIn ? (
          <Link href="/my-ltc" className="hover:text-white/60 transition-colors flex items-center gap-1 whitespace-nowrap lg:mx-0">
            <span className="material-symbols-outlined text-[16px]">account_circle</span> <span className="hidden sm:inline">My LTC</span>
          </Link>
        ) : (
          <Link href="/customer-login" className="hover:text-white/60 transition-colors flex items-center gap-1 whitespace-nowrap lg:mx-0">
            <span className="material-symbols-outlined text-[16px]">login</span> <span className="hidden sm:inline">Login / Register</span>
          </Link>
        )}
        <LTTLanguageSwitch />
      </div>
    </div>
  );
};

export default TopBar;
