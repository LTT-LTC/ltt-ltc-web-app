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
import { useLocalization } from "@/src/@core/hooks/use-localization";

export default function Dashboard() {
  const { t } = useLocalization();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("admin.executive_dashboard.title")}</h1>
        <LTTButton variant="outline">{t("admin.executive_dashboard.export_report")}</LTTButton>
      </div>

      <div className="rounded-lg border border-border-shadcn bg-card p-6 space-y-4 shadow-sm">
        <h2 className="font-heading text-lg font-semibold border-b border-border-shadcn pb-2">{t("admin.executive_dashboard.summary_title")}</h2>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-shadcn" />
            <LTTInput placeholder={t("admin.executive_dashboard.search_placeholder")} className="pl-9" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground-shadcn">0 / 250</span>
          </div>
          <LTTSelect>
            <LTTSelectTrigger className="w-56">
              <LTTSelectValue placeholder={t("admin.executive_dashboard.time_range_placeholder")} />
            </LTTSelectTrigger>
            <LTTSelectContent>
              <LTTSelectItem value="today">{t("admin.executive_dashboard.period.today")}</LTTSelectItem>
              <LTTSelectItem value="week">{t("admin.executive_dashboard.period.week")}</LTTSelectItem>
              <LTTSelectItem value="month">{t("admin.executive_dashboard.period.month")}</LTTSelectItem>
              <LTTSelectItem value="quarter">{t("admin.executive_dashboard.period.quarter")}</LTTSelectItem>
            </LTTSelectContent>
          </LTTSelect>
        </div>

        <LTTTabs defaultValue="overview">
          <LTTTabsList className="bg-muted-shadcn/50">
            <LTTTabsTrigger value="overview">{t("admin.executive_dashboard.tabs.overview")}</LTTTabsTrigger>
            <LTTTabsTrigger value="detail">{t("admin.executive_dashboard.tabs.detail")}</LTTTabsTrigger>
          </LTTTabsList>
          <LTTTabsContent value="overview" className="pt-4">
            <div className="rounded-lg border border-border-shadcn overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-shadcn bg-muted-shadcn/50 text-muted-foreground-shadcn text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold">{t("admin.executive_dashboard.table.index")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("admin.executive_dashboard.table.metric")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("admin.executive_dashboard.table.current_value")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("admin.executive_dashboard.table.change")}</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("admin.executive_dashboard.table.trend")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-muted-foreground-shadcn">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted-shadcn flex items-center justify-center">
                          <Search className="h-8 w-8 text-muted-foreground-shadcn/30" />
                        </div>
                        <span className="text-base font-medium">{t("admin.executive_dashboard.empty_title")}</span>
                        <p className="text-xs max-w-xs px-4 opacity-70">{t("admin.executive_dashboard.empty_description")}</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </LTTTabsContent>
          <LTTTabsContent value="detail" className="pt-4">
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground-shadcn space-y-2">
              <p className="font-medium">{t("admin.executive_dashboard.detail_title")}</p>
              <p className="text-xs">{t("admin.executive_dashboard.detail_description")}</p>
            </div>
          </LTTTabsContent>
        </LTTTabs>
      </div>
    </div>
  );
}
