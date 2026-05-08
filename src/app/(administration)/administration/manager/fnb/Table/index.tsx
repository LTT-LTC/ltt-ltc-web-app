"use client";
import { useState, useMemo } from "react";
import LTTTable from "@/src/@core/component/AntD/LTTTable";
import LTTBreadcrumb from "@/src/@core/component/AntD/LTTBreadcrumb";
import LTTCard from "@/src/@core/component/AntD/LTTCard";
import LTTButton from "@/src/@core/component/AntD/LTTButton";
import LTTTabs from "@/src/@core/component/AntD/LTTTabs";
import LTTModal from "@/src/@core/component/AntD/LTTModal";
import LTTFormItem from "@/src/@core/component/AntD/LTTFormItem";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import { Form, notification, Input } from "antd";
import Link from "next/link";
import { toLocalDateInput } from "@/src/@core/utils/date";

import { columns } from "./table.type";
import FnbFilter from "../Filter";
import { FnBItem, mockFnBItems, fnbCategories } from "../_mock/data";

const catLabel: Record<string, string> = { popcorn: "Bắp rang", drink: "Nước uống", combo: "Combo", snack: "Snack", other: "Khác" };

const FnbListPage = () => {
  const [items, setItems] = useState<FnBItem[]>(mockFnBItems);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FnBItem | null>(null);
  
  const [form] = Form.useForm();

  const filteredItems = useMemo(() => {
    let list = items;
    if (catFilter !== "all") {
      list = list.filter((i) => i.category === catFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [items, search, catFilter]);

  const handleEdit = (record: FnBItem) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    notification.success({ message: "Đã xóa sản phẩm" });
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      category: "popcorn",
      price: 0,
      cost: 0,
      status: "available"
    });
    setIsModalOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const now = toLocalDateInput(new Date());
      
      const payload = {
        ...values,
        price: Number(values.price),
        cost: Number(values.cost),
        updatedAt: now
      };

      if (editingItem) {
        setItems((prev) => prev.map((i) => i.id === editingItem.id ? { ...i, ...payload } : i));
        notification.success({ message: "Cập nhật thành công" });
      } else {
        setItems((prev) => [{ ...payload, id: "f-" + Date.now(), createdAt: now, imageUrl: "" }, ...prev]);
        notification.success({ message: "Tạo mới thành công" });
      }
      setIsModalOpen(false);
    } catch (e) {
      console.log(e);
    }
  };

  const tabItems = [
    { key: "all", label: `Tất cả (${items.length})` },
    ...fnbCategories.map(c => ({
      key: c,
      label: `${c} (${items.filter(i => i.category === c).length})`
    }))
  ];

  return (
    <>
      <LTTBreadcrumb
        items={[
          { title: "Quản lý rạp" },
          { title: <Link href="/administration/manager/fnb">Đồ ăn & Nước uống</Link> },
        ]}
      />
      <div className="flex justify-end mt-3 mb-4">
        <LTTButton variant="primary" onClick={handleAdd}>
          Thêm sản phẩm
        </LTTButton>
      </div>

      <LTTCard height="table" title="Đồ ăn & Nước uống" className="mt-3">
        <div className="search flex flex-row items-center gap-2 mt-0 mb-4">
          <FnbFilter search={search} onSearchChange={setSearch} />
        </div>
        <LTTTabs
          defaultActiveKey="all"
          activeKey={catFilter}
          onChange={(key) => setCatFilter(key)}
          items={tabItems}
        />
        <LTTTable
          rowKey="id"
          columns={columns(handleEdit, handleDelete)}
          dataSource={filteredItems}
          loading={false}
        />
      </LTTCard>

      <LTTModal
        title={editingItem ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={onSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <LTTFormItem name="name" label="Tên sản phẩm" rules={[{ required: true, message: "Tên không được để trống" }]} className="col-span-2">
              <LTTInput placeholder="Tên sản phẩm" />
            </LTTFormItem>
            <LTTFormItem name="category" label="Danh mục">
              <LTTSelect
                options={fnbCategories.map(c => ({ label: catLabel[c], value: c }))}
              />
            </LTTFormItem>
            <LTTFormItem name="status" label="Trạng thái">
              <LTTSelect
                options={[
                  { label: "Có sẵn", value: "available" },
                  { label: "Hết hàng", value: "out_of_stock" },
                  { label: "Ngưng bán", value: "discontinued" }
                ]}
              />
            </LTTFormItem>
            <LTTFormItem name="price" label="Giá bán (VNĐ)">
              <LTTInput type="number" />
            </LTTFormItem>
            <LTTFormItem name="cost" label="Giá vốn (VNĐ)">
              <LTTInput type="number" />
            </LTTFormItem>
            <LTTFormItem name="description" label="Mô tả" className="col-span-2">
              <Input.TextArea rows={3} />
            </LTTFormItem>
          </div>
        </Form>
      </LTTModal>
    </>
  );
};

export default FnbListPage;
