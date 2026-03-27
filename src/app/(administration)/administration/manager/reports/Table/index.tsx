"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import ReportsFilter from "../Filter";
import Link from "next/link";

const ReportsListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quan ly rap" },
          { title: <Link href="/administration/manager/reports">Bao cao doanh thu</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Xuat Excel
        </LTTButton>
        <LTTButton className="mb-3 mr-3">
          Xuat CSV
        </LTTButton>
        <LTTButton className="mb-3 mr-3">
          Xuat PDF
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Bao cao doanh thu"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <ReportsFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Phong ve" },
    { key: "2", label: "Bap nuoc" },
    { key: "3", label: "Chot ca" },
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

export default ReportsListPage;
