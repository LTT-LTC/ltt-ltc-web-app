"use client";
import dynamic from "next/dynamic";
import LTTAppLoader from "@/src/@core/component/LTTAppLoader";

const StaffDashboard = dynamic(() => import("./index"), {
  loading: () => <LTTAppLoader />,
  ssr: false,
});

export default function StaffDashboardPage() {
  return <StaffDashboard />;
}
