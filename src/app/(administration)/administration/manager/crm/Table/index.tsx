"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import CrmFilter from "../Filter";
import Link from "next/link";

const CrmListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quan ly rap" },
          { title: <Link href="/administration/manager/crm">CRM va Su co</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Ghi nhan su co
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="CRM va Su co"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <CrmFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Khach hang" },
    { key: "2", label: "Su co" },
    { key: "3", label: "Khieu nai" },
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

export default CrmListPage;
