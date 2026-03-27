"use client";

import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import QrCheckinFilter from "../Filter";
import Link from "next/link";

const QrCheckinListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Nhan vien" },
          { title: <Link href="/administration/staff/qr-checkin">Soat ve QR</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton className="mb-3 mr-3">
          Quet QR
        </LTTButton>
      </div>
      <LTTCard
        height="table"
        title="Soat ve QR"
        className="mt-3"
      >
        <div className="search flex flex-row items-center gap-2 mt-0">
          <QrCheckinFilter />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          onChange={() => {}}
          items={[
    { key: "1", label: "Chua soat" },
    { key: "2", label: "Da soat" },
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

export default QrCheckinListPage;
