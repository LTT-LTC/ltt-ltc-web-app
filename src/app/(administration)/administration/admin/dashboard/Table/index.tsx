"use client";

import Link from "next/link";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";

const DashboardListPage = () => {
  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quản trị hệ thống" },
          { title: <Link href="/administration/admin/dashboard">Executive Dashboard</Link> },
        ]}
      />

      <div className="flex justify-end mt-3 mb-4">
        <LTTButton variant="outline">Xuất báo cáo</LTTButton>
      </div>

      <LTTCard title="Executive Dashboard" className="mt-3">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Nhập tìm kiếm"
            style={{ width: 360 }}
          />
          <Select
            defaultValue="month"
            style={{ width: 220 }}
            options={[
              { label: "Hôm nay", value: "today" },
              { label: "Tuần này", value: "week" },
              { label: "Tháng này", value: "month" },
              { label: "Quý này", value: "quarter" },
            ]}
          />
        </div>

        <LTTTabs
          defaultActiveKey="overview"
          items={[
            {
              key: "overview",
              label: "Tổng quan",
              children: (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold">STT</th>
                        <th className="px-4 py-3 text-left font-semibold">Chỉ số</th>
                        <th className="px-4 py-3 text-left font-semibold">Giá trị hiện tại</th>
                        <th className="px-4 py-3 text-left font-semibold">Thay đổi</th>
                        <th className="px-4 py-3 text-left font-semibold">Xu hướng</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-gray-500">
                          No data
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ),
            },
            {
              key: "detail",
              label: "Chi tiết",
              children: <div className="text-center text-gray-500 py-12">Chi tiết sẽ hiển thị tại đây</div>,
            },
          ]}
        />
      </LTTCard>
    </>
  );
};

export default DashboardListPage;
