"use client";

import { useState, useMemo } from "react";
import { Form, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import { LTTInput, LTTInputTextArea } from "@/src/@core/component/AntD/LTTInput";

import { columns } from "../table.type";
import SeatmapFilter from "../Filter";
import { SeatType, mockSeatTypes, Screen, mockScreens } from "../_mock/data";

const SeatTypesPage = () => {
  const [activeTab, setActiveTab] = useState("seat_types");
  const [seatTypes, setSeatTypes] = useState<SeatType[]>(mockSeatTypes);
  const [screens] = useState<Screen[]>(mockScreens);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeatType | null>(null);
  
  const [form] = Form.useForm();

  const filtered = useMemo(() => {
    if (!searchQuery) return seatTypes;
    const q = searchQuery.toLowerCase();
    return seatTypes.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [seatTypes, searchQuery]);

  const filteredScreens = useMemo(() => {
    if (!searchQuery) return screens;
    const q = searchQuery.toLowerCase();
    return screens.filter(
      (screen) =>
        String(screen.screenNumber).includes(q) ||
        screen.screenType.toLowerCase().includes(q) ||
        screen.cinemaId.toLowerCase().includes(q),
    );
  }, [screens, searchQuery]);

  const screenColumns: ColumnsType<Screen> = [
    {
      title: "Màn chiếu",
      key: "screenNumber",
      dataIndex: "screenNumber",
      render: (value: number) => `Phòng ${value}`,
    },
    {
      title: "Loại phòng",
      key: "screenType",
      dataIndex: "screenType",
    },
    {
      title: "Cinema ID",
      key: "cinemaId",
      dataIndex: "cinemaId",
    },
    {
      title: "Số ghế",
      key: "seatCount",
      dataIndex: "seatCount",
      align: "center",
    },
    {
      title: "Cập nhật",
      key: "updatedAt",
      dataIndex: "updatedAt",
    },
  ];

  const openCreate = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ name: "", description: "", priceMultiplier: "1.0" });
    setDialogOpen(true);
  };

  const openEdit = (item: SeatType) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      priceMultiplier: String(item.priceMultiplier),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const now = new Date().toLocaleString("sv-SE").slice(0, 16).replace("T", " ");
      
      const payload = {
        name: values.name,
        description: values.description || "",
        priceMultiplier: parseFloat(values.priceMultiplier) || 1,
        seatOccupied: editingItem?.seatOccupied ?? 1,
        orientation: editingItem?.orientation ?? "square",
        updatedAt: now,
      };

      if (editingItem) {
        setSeatTypes((prev) =>
          prev.map((s) =>
            s.id === editingItem.id ? { ...s, ...payload } : s
          )
        );
        notification.success({ message: "Cập nhật thành công" });
      } else {
        const newId = seatTypes.length > 0 ? Math.max(...seatTypes.map((s) => s.id)) + 1 : 1;
        setSeatTypes((prev) => [
          ...prev,
          { ...payload, id: newId, createdAt: now },
        ]);
        notification.success({ message: "Tạo mới thành công" });
      }
      setDialogOpen(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteSelected = () => {
    setSeatTypes((prev) => prev.filter((s) => !selected.has(s.id)));
    setSelected(new Set());
    setDeleteDialogOpen(false);
    notification.success({ message: `Đã xóa ${selected.size} loại ghế` });
  };

  const handleDeleteOne = (id: number) => {
    setSeatTypes((prev) => prev.filter((s) => s.id !== id));
    const next = new Set(selected);
    next.delete(id);
    setSelected(next);
    notification.success({ message: "Đã xóa loại ghế" });
  };

  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quản lý rạp" },
          { title: <Link href="/administration/manager/seatmap">Seat Map Editor</Link> },
        ]}
      />
      <div className="flex justify-end mt-3 mb-4 gap-2">
        {activeTab === "seat_types" && selected.size > 0 && (
          <LTTButton danger variant="primary" onClick={() => setDeleteDialogOpen(true)}>
            Xóa {selected.size} mục
          </LTTButton>
        )}
        {activeTab === "seat_types" ? (
          <LTTButton variant="primary" onClick={openCreate}>
            Thêm loại ghế
          </LTTButton>
        ) : (
          <LTTButton
            variant="primary"
            onClick={() =>
              notification.info({
                message: "Seat map wizard",
                description: "ScreenCreateWizard sẽ được tích hợp ở bước tiếp theo.",
              })
            }
          >
            Tạo màn chiếu
          </LTTButton>
        )}
      </div>

      <LTTCard height="table" title="Seat Map Editor">
        <LTTTabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "seat_types", label: "Seat Types" },
            { key: "screens", label: "Screens" },
          ]}
        />

        <div className="search flex flex-row items-center gap-2 mt-0 mb-4">
          <SeatmapFilter search={searchQuery} onSearchChange={setSearchQuery} />
        </div>

        {activeTab === "seat_types" ? (
          <LTTTable
            rowKey="id"
            rowSelection={{
              selectedRowKeys: Array.from(selected),
              onChange: (selectedRowKeys) => setSelected(new Set(selectedRowKeys as number[])),
            }}
            columns={columns(openEdit, handleDeleteOne)}
            dataSource={filtered}
          />
        ) : (
          <LTTTable
            rowKey="id"
            columns={screenColumns}
            dataSource={filteredScreens}
          />
        )}
      </LTTCard>

      {/* Create/Edit Dialog */}
      <LTTModal
        title={editingItem ? "Chỉnh sửa loại ghế" : "Thêm loại ghế mới"}
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onOk={handleSave}
        width={500}
      >
        <Form form={form} layout="vertical">
          <LTTFormItem 
            name="name" 
            label="Tên loại ghế" 
            rules={[{ required: true, message: "Tên loại ghế không được để trống" }]}
          >
            <LTTInput placeholder="VD: VIP, Standard..." />
          </LTTFormItem>
          
          <LTTFormItem name="description" label="Mô tả">
            <LTTInputTextArea placeholder="Mô tả ngắn về loại ghế..." />
          </LTTFormItem>

          <LTTFormItem name="priceMultiplier" label="Hệ số giá" rules={[{ required: true, message: "Hệ số giá không được để trống" }]}>
            <LTTInput type="number" step={0.1} min={0.1} />
          </LTTFormItem>
        </Form>
      </LTTModal>

      {/* Delete Confirmation Dialog */}
      <LTTModal
        title="Xác nhận xóa"
        open={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onOk={handleDeleteSelected}
        okButtonProps={{ danger: true }}
        okText="Xóa"
      >
        <p>Bạn có chắc chắn muốn xóa {selected.size} loại ghế đã chọn không?</p>
      </LTTModal>
    </>
  );
};

export default SeatTypesPage;
