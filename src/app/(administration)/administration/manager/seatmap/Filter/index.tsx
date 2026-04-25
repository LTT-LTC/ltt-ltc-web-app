"use client";

import { LTTInputSearch } from "@/src/@core/component/AntD/LTTInput";
import { useLocalization } from "@/src/@core/hooks/use-localization";

interface SeatmapFilterProps {
  onSearchChange: (search: string) => void;
  search: string;
}

const SeatmapFilter = ({ onSearchChange, search }: SeatmapFilterProps) => {
  const { t } = useLocalization();
  return (
    <div className="w-[380px]">
      <LTTInputSearch 
        placeholder={t("admin.seatmap.search_placeholder")}
        allowClear
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SeatmapFilter;
