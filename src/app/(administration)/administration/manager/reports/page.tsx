"use client";

import LTTAppLoader from "@/src/@core/component/LTTAppLoader";
import dynamic from "next/dynamic";

const ReportsListPage = dynamic(() => import("./Table/index"), { loading: () => <LTTAppLoader />, ssr: false });

export default function ReportsPage() {
  return (
    <ReportsListPage />
  );
}
