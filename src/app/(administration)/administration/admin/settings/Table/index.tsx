"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import SettingsFilter from "../Filter";
import Link from "next/link";

const SettingsListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quan tri he thong" },
          { title: <Link href="/administration/admin/settings">Cai dat he thong</Link> },
        ]}
      />
      <div className="flex justify-end">
      </div>
      <LTTCard
        height="table"
        title="Cai dat he thong"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <SettingsFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Chung" },
    { key: "2", label: "Bao mat" },
    { key: "3", label: "Thong bao" },
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

export default SettingsListPage;
