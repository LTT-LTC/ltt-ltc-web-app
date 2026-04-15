"use client";

import { Select } from "antd";
import { AdminCinema } from "../_mock/data";

interface ReportFilterProps {
  cinema: string;
  onCinemaChange: (val: string) => void;
  cinemas: AdminCinema[];
}

const ReportFilter = ({ cinema, onCinemaChange, cinemas }: ReportFilterProps) => {
  return (
    <Select
      value={cinema}
      onChange={onCinemaChange}
      style={{ width: 250 }}
      options={[
        { label: "Tất cả rạp", value: "all" },
        ...cinemas.map((c) => ({ label: c.name, value: c.id })),
      ]}
    />
  );
};

export default ReportFilter;

