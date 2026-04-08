"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import PromotionsFilter from "../Filter";
import Link from "next/link";

const PromotionsListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quan tri he thong" },
          { title: <Link href="/administration/admin/promotions">Khuyen mai va Gift Card</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Tao khuyen mai
        </LTTButton>
        <LTTButton className="mb-3 mr-3">
          Tao gift card
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Khuyen mai va Gift Card"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <PromotionsFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Khuyen mai" },
    { key: "2", label: "Gift Card" },
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

export default PromotionsListPage;
