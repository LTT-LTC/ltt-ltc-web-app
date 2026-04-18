"use client";
import dynamic from "next/dynamic";
import LTTAppLoader from "@/src/@core/component/LTTAppLoader";

const POSDashboard = dynamic(() => import("./index"), {
  loading: () => <LTTAppLoader />,
  ssr: false,
});

export default function POSDashboardPage() {
  return <POSDashboard />;
}
