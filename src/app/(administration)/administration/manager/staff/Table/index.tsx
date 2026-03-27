"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import StaffFilter from "../Filter";
import Link from "next/link";

const StaffListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quan ly rap" },
          { title: <Link href="/administration/manager/staff">Nhan vien va Phan quyen</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Them nhan vien
        </LTTButton>
        <LTTButton className="mb-3 mr-3">
          Reset mat khau
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Nhan vien va Phan quyen"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <StaffFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Dang hoat dong" },
    { key: "0", label: "Vo hieu hoa" },
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

export default StaffListPage;
