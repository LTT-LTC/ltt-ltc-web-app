"use client";

import LTTAppLoader from "@/src/@core/component/LTTAppLoader";
import dynamic from "next/dynamic";

const ShiftReportListPage = dynamic(() => import("./Table/index"), { loading: () => <LTTAppLoader />, ssr: false });

export default function ShiftReportPage() {
  return (
    <ShiftReportListPage />
  );
}
