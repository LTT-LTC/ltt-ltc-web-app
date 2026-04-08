"use client";

import { Search } from "lucide-react";
import { LTTInput } from "@/src/@core/component/LTTShadcnUI/LTTInput";
import {
  LTTSelect,
  LTTSelectContent,
  LTTSelectItem,
  LTTSelectTrigger,
  LTTSelectValue,
} from "@/src/@core/component/LTTShadcnUI/LTTSelect";
import { LTTButton } from "@/src/@core/component/LTTShadcnUI/LTTButton";
import {
  LTTTabs,
  LTTTabsContent,
  LTTTabsList,
  LTTTabsTrigger,
} from "@/src/@core/component/LTTShadcnUI/LTTTabs";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Dashboard điều hành</h1>
        <LTTButton variant="outline">Xuất báo cáo</LTTButton>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card p-6 space-y-4 shadow-sm">
        <h2 className="font-heading text-lg font-semibold border-b border-border-shadcn pb-2">Tổng quan hoạt động</h2>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
            <LTTInput placeholder="Nhập tìm kiếm" className="pl-9" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground-shadcn">0 / 250</span>
          </div>
          <LTTSelect>
            <LTTSelectTrigger className="w-56">
              <LTTSelectValue placeholder="Chọn khoảng thời gian" />
            </LTTSelectTrigger>
            <LTTSelectContent>
              <LTTSelectItem value="today">Hôm nay</LTTSelectItem>
              <LTTSelectItem value="week">Tuần này</LTTSelectItem>
              <LTTSelectItem value="month">Tháng này</LTTSelectItem>
              <LTTSelectItem value="quarter">Quý này</LTTSelectItem>
            </LTTSelectContent>
          </LTTSelect>
        </div>

        <LTTTabs defaultValue="overview">
          <LTTTabsList className="bg-muted-shadcn/50">
            <LTTTabsTrigger value="overview">Tổng quan</LTTTabsTrigger>
            <LTTTabsTrigger value="detail">Chi tiết</LTTTabsTrigger>
          </LTTTabsList>
          <LTTTabsContent value="overview" className="pt-4">
            <div className="rounded-lg border border-border-shadcn overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-shadcn bg-muted-shadcn/50 text-muted-foreground-shadcn text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold">STT</th>
                    <th className="px-4 py-3 text-left font-semibold">Chỉ số</th>
                    <th className="px-4 py-3 text-left font-semibold">Giá trị hiện tại</th>
                    <th className="px-4 py-3 text-left font-semibold">Thay đổi</th>
                    <th className="px-4 py-3 text-left font-semibold">Xu hướng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-muted-foreground-shadcn">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted-shadcn flex items-center justify-center">
                          <Search className="h-8 w-8 text-muted-foreground-shadcn/30" />
                        </div>
                        <span className="text-base font-medium">Hiện tại chưa có dữ liệu đồng bộ</span>
                        <p className="text-xs max-w-xs px-4 opacity-70">Các chỉ số vận hành sẽ được cập nhật tự động sau khi rạp chính thức hoạt động trong khung giờ đã chọn.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </LTTTabsContent>
          <LTTTabsContent value="detail" className="pt-4">
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground-shadcn space-y-2">
              <p className="font-medium">Thông tin chi tiết đang được chuẩn bị</p>
              <p className="text-xs">Vui lòng quay lại sau khi dữ liệu hệ thống được làm sạch.</p>
            </div>
          </LTTTabsContent>
        </LTTTabs>
      </div>
    </div>
  );
}
