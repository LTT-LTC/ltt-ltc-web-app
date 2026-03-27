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
          { title: "Quan ly rap" },
          { title: <Link href="/administration/manager/dashboard">Dashboard dieu hanh</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Xuat bao cao
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Dashboard dieu hanh"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <DashboardFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Tong quan" },
    { key: "2", label: "Chi tiet" },
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
