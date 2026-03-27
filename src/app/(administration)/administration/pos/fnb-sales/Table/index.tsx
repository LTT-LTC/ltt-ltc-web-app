"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import FnbSalesFilter from "../Filter";
import Link from "next/link";

const FnbSalesListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "May POS" },
          { title: <Link href="/administration/pos/fnb-sales">Ban do an va nuoc</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Them vao don
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Ban do an va nuoc"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <FnbSalesFilter />
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

export default FnbSalesListPage;
