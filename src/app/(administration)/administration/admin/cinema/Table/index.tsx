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
          { title: "Quan tri he thong" },
          { title: <Link href="/administration/admin/cinema">Rap chieu phim</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Them rap moi
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Rap chieu phim"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <CinemaFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Dang hoat dong" },
    { key: "0", label: "Tam dong" },
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
