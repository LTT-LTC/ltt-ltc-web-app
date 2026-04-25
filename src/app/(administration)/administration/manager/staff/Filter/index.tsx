"use client";
import { useEffect, useState } from "react";
import LTTInput from "@/src/@core/component/AntD/LTTInput";
import LTTSelect from "@/src/@core/component/AntD/LTTSelect";
import { staffRoles } from "../_mock/data";
import { useLocalization } from "@/src/@core/hooks/use-localization";

interface StaffFilterProps {
  onFilterChange: (filters: { roleId?: string; search?: string }) => void;
}

const StaffFilter = ({ onFilterChange }: StaffFilterProps) => {
  const { t } = useLocalization();
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
        placeholder={t("admin.staff.search_placeholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 250 }}
      />
      <LTTSelect
        value={roleFilter}
        onChange={setRoleFilter}
        style={{ width: 200 }}
        options={[
          { label: t("admin.staff.filters.all_roles"), value: "all" },
          ...staffRoles.map((r) => ({ label: r, value: r })),
        ]}
      />
    </div>
  );
};

export default StaffFilter;
