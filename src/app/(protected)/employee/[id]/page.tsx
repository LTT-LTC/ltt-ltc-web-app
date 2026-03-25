"use client";

import LTTAppLoader from "@/src/@core/component/LTTAppLoader";
import dynamic from "next/dynamic";
import { EmployeeDetailsProvider } from "./provider";

const EmployeeDetailPage = dynamic(() => import("."), {
  loading: () => <LTTAppLoader />,
  ssr: false,
});

export default function Employee() {
  return (
    <EmployeeDetailsProvider>
      <EmployeeDetailPage />
    </EmployeeDetailsProvider>
  );
}
