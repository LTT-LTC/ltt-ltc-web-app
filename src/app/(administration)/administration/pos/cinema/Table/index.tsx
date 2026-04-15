"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import CinemaFilter from "../Filter";
import Link from "next/link";

const CinemaListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quan ly rap" },
          { title: <Link href="/administration/pos/cinema">Cau hinh rap</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Chinh sua thong tin
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Cau hinh rap"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <CinemaFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => { }}
          items={[
            { key: "1", label: "Thong tin chung" },
            { key: "2", label: "Tien ich" },
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

export default CinemaListPage;
