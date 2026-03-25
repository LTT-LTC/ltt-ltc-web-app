import LTTCard from "@/src/@core/component/AntD/LTTCard";
import EmployeeDetailTab from "./Tab";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import Link from "next/link";
import { useParams } from "next/navigation";
import EmployeeDetailHistory from "./History";

const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Tổng quan" },
          { title: <Link href="/employee">Danh sách nhân sự</Link> },
          { title: <Link href={`/employee/${id}`}>Chi tiết nhân sự</Link> },
        ]}
      />
      <div className="grid grid-cols-3 gap-4">
        <LTTCard className="mt-5 col-span-2" title="Thông tin cá nhân">
          <EmployeeDetailTab />
        </LTTCard>
        <LTTCard className="mt-5 col-span-1" title="Lịch sử cá nhân">
          <EmployeeDetailHistory />
        </LTTCard>
      </div>
    </>
  );
};

export default EmployeeDetailPage;
