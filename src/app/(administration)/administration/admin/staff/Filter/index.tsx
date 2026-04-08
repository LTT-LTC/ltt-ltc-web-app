"use client";
import { useEffect, useState } from "react";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import { staffRoles } from "../_mock/data";

interface StaffFilterProps {
  onFilterChange: (filters: { roleId?: string; search?: string }) => void;
}

const StaffFilter = ({ onFilterChange }: StaffFilterProps) => {
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    onFilterChange({
      roleId: roleFilter === "all" ? undefined : roleFilter,
      search: search || undefined,
    });
  }, [roleFilter, search]);

  return (
    <div className="flex items-center gap-3">
      <LTTInput
        placeholder="Tìm nhân viên..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 250 }}
      />
      <LTTSelect
        value={roleFilter}
        onChange={setRoleFilter}
        style={{ width: 200 }}
        options={[
          { label: "Tất cả vai trò", value: "all" },
          ...staffRoles.map((r) => ({ label: r, value: r })),
        ]}
      />
    </div>
  );
};

export default StaffFilter;
