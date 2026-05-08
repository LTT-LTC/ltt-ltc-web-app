"use client";
import React, { useState, useMemo } from "react";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import { columns } from "./table.type";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import { Form, message } from "antd";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import MoviesFilter from "../Filter";
import Link from "next/link";
import { AdminMovie, mockAdminMovies } from "../_mock/data";
import { toLocalDateInput } from "@/src/@core/utils/date";

const MoviesListPage = () => {
  const [items, setItems] = useState<AdminMovie[]>(mockAdminMovies);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMovie | null>(null);

  const [form] = Form.useForm();

  const filtered = useMemo(() => {
    let list = items;
    if (tab !== "all") list = list.filter((m) => m.status === tab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) || m.genre.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, search, tab]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      duration: 120,
      ageRating: "P",
      status: "coming_soon",
    });
    setDialogOpen(true);
  };

  const openEdit = (m: AdminMovie) => {
    setEditing(m);
    form.setFieldsValue({
      title: m.title,
      genre: m.genre,
      duration: m.duration,
      ageRating: m.ageRating,
      director: m.director,
      cast: m.cast,
      releaseDate: m.releaseDate,
      endDate: m.endDate,
      status: m.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const now = toLocalDateInput(new Date());
      if (editing) {
        setItems((p) =>
          p.map((i) =>
            i.id === editing.id ? { ...i, ...values } : i
          )
        );
        message.success("Cập nhật thành công");
      } else {
        setItems((p) => [
          ...p,
          {
            id: `m-${Date.now()}`,
            ...values,
            posterUrl: "",
            trailerUrl: "",
            createdAt: now,
          },
        ]);
        message.success("Tạo mới thành công");
      }
      setDialogOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    setItems((p) => p.filter((i) => i.id !== id));
    message.success("Đã xóa");
  };

  const bulkDelete = () => {
    setItems((p) => p.filter((i) => !selectedKeys.includes(i.id)));
    message.success(`Đã xóa ${selectedKeys.length} phim`);
    setSelectedKeys([]);
    setDeleteOpen(false);
  };

  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quản lý rạp" },
          { title: <Link href="/administration/manager/movies">Quản lý phim</Link> },
        ]}
      />
      <div className="flex justify-end">
        <LTTButton variant="primary" className="mb-3 mr-3" onClick={openCreate}>
          Thêm phim
        </LTTButton>
      </div>

      <LTTCard height="table" title="Quản lý phim" className="mt-3">
        <div className="search flex flex-row items-center justify-between gap-2 mt-0">
          <MoviesFilter onSearch={setSearch} />
          {selectedKeys.length > 0 && (
            <LTTButton
              danger
              variant="primary"
              onClick={() => setDeleteOpen(true)}
            >
              Xóa {selectedKeys.length}
            </LTTButton>
          )}
        </div>

        <LTTTabs
          defaultActiveKey="all"
          onChange={(key) => setTab(key)}
          items={[
            {
              key: "all",
              label: `Tất cả (${items.length})`,
            },
            {
              key: "now_showing",
              label: `Đang chiếu (${
                items.filter((i) => i.status === "now_showing").length
              })`,
            },
            {
              key: "coming_soon",
              label: `Sắp chiếu (${
                items.filter((i) => i.status === "coming_soon").length
              })`,
            },
            {
              key: "ended",
              label: `Đã kết thúc (${
                items.filter((i) => i.status === "ended").length
              })`,
            },
          ]}
        />

        <LTTTable
          columns={columns(openEdit, handleDelete)}
          dataSource={filtered}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: (newSelectedRowKeys) => setSelectedKeys(newSelectedRowKeys),
          }}
          loading={false}
        />
      </LTTCard>

      <LTTModal
        title={editing ? "Chỉnh sửa phim" : "Thêm phim mới"}
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onOk={handleSave}
        width={800}
      >
        <Form form={form} layout="vertical" className="grid grid-cols-2 gap-x-4">
          <div className="col-span-2">
            <LTTFormItem
              label="Tên phim"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên phim" }]}
            >
              <LTTInput />
            </LTTFormItem>
          </div>
          <LTTFormItem label="Thể loại" name="genre">
            <LTTInput />
          </LTTFormItem>
          <LTTFormItem label="Thời lượng (phút)" name="duration">
            <LTTInput type="number" />
          </LTTFormItem>
          <LTTFormItem label="Phân loại tuổi" name="ageRating">
            <LTTSelect
              options={[
                { label: "P", value: "P" },
                { label: "T13", value: "T13" },
                { label: "T16", value: "T16" },
                { label: "T18", value: "T18" },
                { label: "C", value: "C" },
              ]}
            />
          </LTTFormItem>
          <LTTFormItem label="Trạng thái" name="status">
            <LTTSelect
              options={[
                { label: "Sắp chiếu", value: "coming_soon" },
                { label: "Đang chiếu", value: "now_showing" },
                { label: "Đã kết thúc", value: "ended" },
              ]}
            />
          </LTTFormItem>
          <LTTFormItem label="Đạo diễn" name="director">
            <LTTInput />
          </LTTFormItem>
          <LTTFormItem label="Diễn viên" name="cast">
            <LTTInput />
          </LTTFormItem>
          <LTTFormItem label="Ngày chiếu" name="releaseDate">
            <LTTInput type="date" />
          </LTTFormItem>
          <LTTFormItem label="Ngày kết thúc" name="endDate">
            <LTTInput type="date" />
          </LTTFormItem>
        </Form>
      </LTTModal>

      <LTTModal
        title="Xác nhận xóa"
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onOk={bulkDelete}
        okButtonProps={{ danger: true }}
        okText="Xóa"
      >
        <p>Xóa {selectedKeys.length} phim đã chọn?</p>
      </LTTModal>
    </>
  );
};


export default MoviesListPage;
