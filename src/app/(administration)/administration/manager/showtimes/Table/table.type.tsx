"use client";
import { ColumnsType } from "antd/es/table";
import { AdminShowtime } from "../_mock/data";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTConfirmDialog from "@/src/@core/component/LTTConfirmDialog";

export const columns = (
  t: (key: string) => string,
  onEdit: (record: AdminShowtime) => void,
  onDelete: (id: string) => void
): ColumnsType<AdminShowtime> => [
    {
      title: t("admin.showtimes.form.movie"),
      key: "movieTitle",
      dataIndex: "movieTitle",
      width: "25%",
    },
    {
      title: t("admin.staff.table.cinema"),
      key: "cinemaName",
      dataIndex: "cinemaName",
      width: "15%",
    },
    {
      title: t("admin.showtimes.form.screen"),
      key: "screenNumber",
      dataIndex: "screenNumber",
      width: "10%",
      render: (val: number) => `${t("admin.showtimes.form.screen_placeholder")} ${val}`,
    },
    {
      title: t("admin.news_and_offers.table.start_date"),
      key: "date",
      dataIndex: "date",
      width: "10%",
    },
    {
      title: t("admin.showtimes.view.calendar"),
      key: "time",
      width: "15%",
      render: (_, record) => record.startTime + " - " + record.endTime,
    },
    {
      title: t("admin.showtimes.table.format"),
      key: "format",
      dataIndex: "format",
      width: "10%",
    },
    {
      title: t("admin.showtimes.table.price"),
      key: "basePrice",
      dataIndex: "basePrice",
      width: "10%",
      render: (val: number) => val.toLocaleString("vi-VN") + "đ",
    },
    {
      title: t("admin.showtimes.table.status"),
      key: "status",
      dataIndex: "status",
      width: "10%",
      render: (status: string) => {
        let color = "text-blue-500";
        let label = t("admin.showtimes.status.scheduled");
        if (status === "cancelled") { color = "text-red-500"; label = t("admin.showtimes.status.cancelled"); }
        else if (status === "completed") { color = "text-gray-500"; label = t("admin.showtimes.status.completed"); }
        return <span className={color}>{label}</span>;
      },
    },
    {
      title: t("admin.showtimes.table.actions"),
      key: "action",
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          <LTTButton variant="outline" onClick={() => onEdit(record)}>{t("admin.showtimes.actions.edit")}</LTTButton>
          <LTTConfirmDialog
            title={t("admin.common.delete_confirm.title")}
            description={t("admin.common.delete_confirm.message")}
            confirmText={t("admin.common.delete_confirm.ok")}
            cancelText={t("admin.common.delete_confirm.cancel")}
            onConfirm={() => onDelete(record.id)}
            trigger={<LTTButton variant="outline" danger>{t("admin.common.delete_confirm.ok")}</LTTButton>}
          />
        </div>
      ),
    },
  ];
