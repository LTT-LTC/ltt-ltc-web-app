"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import FnbFilter from "../Filter";
import Link from "next/link";

const FnbListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quan tri he thong" },
          { title: <Link href="/administration/admin/fnb">Do an va Nuoc uong</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Them san pham
        </LTTButton>
        <LTTButton className="mb-3 mr-3">
          Tao combo
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Do an va Nuoc uong"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <FnbFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "San pham" },
    { key: "2", label: "Combo" },
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

export default FnbListPage;
