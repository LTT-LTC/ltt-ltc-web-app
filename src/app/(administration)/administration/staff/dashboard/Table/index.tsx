"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import DashboardFilter from "../Filter";
import Link from "next/link";

const DashboardListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Nhan vien" },
          { title: <Link href="/administration/staff/dashboard">Dashboard cua toi</Link> },
        ]}
      />
      <div className="flex justify-end">
      </div>
      <LTTCard
        height="table"
        title="Dashboard cua toi"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <DashboardFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Hom nay" },
    { key: "2", label: "Tuan nay" },
    { key: "3", label: "Thang nay" },
          ]}
        />
        <LTTTable
          columns={columns()}
          dataSource={[]}
          loading={false}
        />
      </LTTCard>
    </>
  );
};

export default DashboardListPage;
