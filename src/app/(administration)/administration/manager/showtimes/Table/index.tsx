"use client";

import { useMemo, useState } from "react";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import LTTForm from "@/src/@core/component/AntD/LTTForm";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import { Form, notification } from "antd";
import Link from "next/link";
import dayjs from "dayjs";

import { columns } from "./table.type";
import ShowtimesFilter from "../Filter";
import { AdminShowtime, mockAdminShowtimes, mockAdminMovies, mockAdminCinemas } from "../_mock/data";

const ShowtimesListPage = () => {
  const [items, setItems] = useState<AdminShowtime[]>(mockAdminShowtimes);
  const [filters, setFilters] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminShowtime | null>(null);
  
  const [form] = Form.useForm();

  const filteredItems = useMemo(() => {
    let list = items;
    if (filters.date) {
      const dateStr = dayjs(filters.date).format("YYYY-MM-DD");
      list = list.filter((s) => s.date === dateStr);
    }
    if (filters.cinemaId && filters.cinemaId !== "all") {
      list = list.filter((s) => s.cinemaId === filters.cinemaId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((s) => s.movieTitle.toLowerCase().includes(q));
    }
    return list;
  }, [items, filters]);

  const handleEdit = (record: AdminShowtime) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    notification.success({ message: "Đã xóa suất chiếu" });
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      format: "2D Phụ Đề Việt",
      basePrice: 105000,
      screenNumber: 1,
      status: "scheduled"
    });
    setIsModalOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const movie = mockAdminMovies.find((m) => m.id === values.movieId);
      const cinema = mockAdminCinemas.find((c) => c.id === values.cinemaId);
      
      const payload = {
        ...values,
        movieTitle: movie?.title || "",
        cinemaName: cinema?.name || "",
      };

      if (editingItem) {
        setItems((prev) => prev.map((i) => i.id === editingItem.id ? { ...i, ...payload } : i));
        notification.success({ message: "Cập nhật thành công" });
      } else {
        setItems((prev) => [{ ...payload, id: "st-" + Date.now() }, ...prev]);
        notification.success({ message: "Tạo mới thành công" });
      }
      setIsModalOpen(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quản lý rạp" },
          { title: <Link href="/administration/manager/showtimes">Xếp lịch chiếu</Link> },
        ]}
      />
      <div className="flex justify-end mt-3 mb-4">
        <LTTButton variant="primary" onClick={handleAdd}>
          Thêm suất chiếu
        </LTTButton>
      </div>

      <LTTCard height="table" title="Xếp lịch chiếu" className="mt-3">
        <div className="search flex flex-row items-center gap-2 mt-0 mb-4">
          <ShowtimesFilter onFilterChange={(f) => setFilters(f)} />
        </div>
        <LTTTabs
          defaultActiveKey="1"
          items={[
            { key: "1", label: "Tất cả" },
          ]}
        />
        <LTTTable
          rowKey="id"
          columns={columns(handleEdit, handleDelete)}
          dataSource={filteredItems}
        />
      </LTTCard>

      <LTTModal
        title={editingItem ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={onSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <LTTFormItem name="movieId" label="Phim" rules={[{ required: true, message: "Chọn phim" }]}>
              <LTTSelect
                options={mockAdminMovies.map(m => ({ label: m.title, value: m.id }))}
                placeholder="Chọn phim"
              />
            </LTTFormItem>
            <LTTFormItem name="cinemaId" label="Rạp" rules={[{ required: true, message: "Chọn rạp" }]}>
              <LTTSelect
                options={mockAdminCinemas.map(c => ({ label: c.name, value: c.id }))}
                placeholder="Chọn rạp"
              />
            </LTTFormItem>
            <LTTFormItem name="screenNumber" label="Phòng chiếu">
              <LTTInput type="number" />
            </LTTFormItem>
            <LTTFormItem name="date" label="Ngày chiếu (YYYY-MM-DD)" rules={[{ required: true }]}>
              <LTTInput />
            </LTTFormItem>
            <LTTFormItem name="startTime" label="Giờ bắt đầu (HH:mm)" rules={[{ required: true }]}>
              <LTTInput />
            </LTTFormItem>
            <LTTFormItem name="endTime" label="Giờ kết thúc (HH:mm)">
              <LTTInput />
            </LTTFormItem>
            <LTTFormItem name="format" label="Định dạng">
              <LTTInput />
            </LTTFormItem>
            <LTTFormItem name="basePrice" label="Giá cơ bản">
              <LTTInput type="number" />
            </LTTFormItem>
            <LTTFormItem name="status" label="Trạng thái">
              <LTTSelect
                options={[
                  { label: "Đã lên lịch", value: "scheduled" },
                  { label: "Đã chiếu", value: "completed" },
                  { label: "Đã hủy", value: "cancelled" }
                ]}
              />
            </LTTFormItem>
          </div>
        </Form>
      </LTTModal>
    </>
  );
};

export default ShowtimesListPage;
