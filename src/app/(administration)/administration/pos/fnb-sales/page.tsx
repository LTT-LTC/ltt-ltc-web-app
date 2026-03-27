"use client";

import LTTAppLoader from "@/src/@core/component/LTTAppLoader";
import dynamic from "next/dynamic";

const FnbSalesListPage = dynamic(() => import("./Table/index"), { loading: () => <LTTAppLoader />, ssr: false });

export default function FnbSalesPage() {
  return (
    <FnbSalesListPage />
  );
}
