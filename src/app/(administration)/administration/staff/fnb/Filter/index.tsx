"use client";

import { Input } from "antd";

interface FnbFilterProps {
  onSearchChange: (search: string) => void;
  search: string;
}

const FnbFilter = ({ onSearchChange, search }: FnbFilterProps) => {
  return (
    <div className="w-[380px]">
      <Input.Search 
        placeholder="Tìm kiếm sản phẩm..."
        allowClear
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onSearch={(v) => onSearchChange(v)}
      />
    </div>
  );
};

export default FnbFilter;
