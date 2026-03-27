"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import RefundsFilter from "../Filter";
import Link from "next/link";

const RefundsListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quan tri he thong" },
          { title: <Link href="/administration/admin/refunds">Hoan tra</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Tao hoan tra
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Hoan tra"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <RefundsFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Cho duyet" },
    { key: "2", label: "Da duyet" },
    { key: "0", label: "Tu choi" },
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

export default RefundsListPage;
