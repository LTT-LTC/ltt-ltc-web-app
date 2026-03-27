"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import ShowtimesFilter from "../Filter";
import Link from "next/link";

const ShowtimesListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quan tri he thong" },
          { title: <Link href="/administration/admin/showtimes">Suat chieu</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Them suat chieu
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Suat chieu"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <ShowtimesFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Hom nay" },
    { key: "2", label: "Ngay mai" },
    { key: "3", label: "Tuan nay" },
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

export default ShowtimesListPage;
