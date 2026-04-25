"use client";

import { useMemo, useState } from "react";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import { notification } from "antd";

import { columns } from "./table.type";
import { StaffBooking, mockBookings } from "../../../_shared/staffMockData";
import { Search, AlertTriangle } from "lucide-react";

const BookingHistoryTable = () => {
  const [items, setItems] = useState<StaffBooking[]>(mockBookings);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [refundItem, setRefundItem] = useState<StaffBooking | null>(null);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeTab !== "all") {
      list = list.filter((b) => b.status === activeTab);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.customerPhone.includes(q)
      );
    }
    return list;
  }, [items, search, activeTab]);

  const handlePrint = (record: StaffBooking) => {
    notification.success({
      message: "Đang xử lý in vé",
      description: `Đã gửi lệnh in cho đơn hàng ${record.id}`,
    });
  };

  const handleRefundClick = (record: StaffBooking) => {
    setRefundItem(record);
  };

  const executeRefund = () => {
    if (!refundItem) return;
    setItems((prev) =>
      prev.map((i) => (i.id === refundItem.id ? { ...i, status: "cancelled" } : i))
    );
    notification.success({
      message: "Thành công",
      description: `Đã hoàn tiền cho đơn ${refundItem.id}`,
    });
    setRefundItem(null);
  };

  return (
    <>
      <LTTCard title="Lịch sử giao dịch POS">
        <div className="flex flex-wrap gap-3 justify-between items-center mb-3">
          <LTTTabs
            defaultActiveKey="all"
            onChange={setActiveTab}
            items={[
              { key: "all", label: "Tất cả" },
              { key: "confirmed", label: "Đã xác nhận" },
              { key: "checked_in", label: "Đã Check-in" },
              { key: "cancelled", label: "Đã Hủy" },
            ]}
          />
          <div className="w-64 shrink-0">
            <LTTInput
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              placeholder="Tìm mã đơn, khách hàng, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <LTTTable
          rowKey="id"
          columns={columns(handlePrint, handleRefundClick)}
          dataSource={filteredItems}
          scroll={{ x: "max-content" }}
        />
      </LTTCard>

      <LTTModal
        open={!!refundItem}
        onCancel={() => setRefundItem(null)}
        footer={null}
        closable={false}
        width={400}
        wrapClassName="rounded-2xl"
      >
        <div className="flex flex-col items-center text-center py-4 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4 shadow-sm ring-4 ring-red-50">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận hoàn tiền</h3>
          <p className="text-sm text-gray-500 mb-6">
            Bạn có chắc chắn muốn hoàn tiền cho đơn <strong className="text-gray-900">{refundItem?.id}</strong>?<br/> Hành động này không thể hoàn tác.
          </p>
          <div className="flex w-full gap-3">
            <LTTButton
              variant="outline"
              className="w-full flex-1"
              onClick={() => setRefundItem(null)}
            >
              Hủy bỏ
            </LTTButton>
            <LTTButton
              className="w-full flex-1 !bg-red-600 !text-white hover:!bg-red-700 border-transparent shadow shadow-red-500/20"
              onClick={executeRefund}
            >
              Xác nhận
            </LTTButton>
          </div>
        </div>
      </LTTModal>
    </>
  );
};

export default BookingHistoryTable;
