"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import TicketSalesFilter from "../Filter";
import Link from "next/link";

const TicketSalesListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Nhan vien" },
          { title: <Link href="/administration/staff/ticket-sales">Ban ve</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Ban ve moi
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Ban ve"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <TicketSalesFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Dang mo ban" },
    { key: "2", label: "Sap chieu" },
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

export default TicketSalesListPage;
