"use client";

import { LTTInputSearch } from "@/src/@core/component/AntD/LTTInput";

interface SeatmapFilterProps {
  onSearchChange: (search: string) => void;
  search: string;
}

const SeatmapFilter = ({ onSearchChange, search }: SeatmapFilterProps) => {
  return (
    <div className="w-[380px]">
      <LTTInputSearch 
        placeholder="Tìm kiếm loại ghế..."
        allowClear
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SeatmapFilter;
