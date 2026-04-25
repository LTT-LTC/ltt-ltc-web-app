import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";
import { useLocalization } from "@/src/@core/hooks/use-localization";

const DashboardFilter = () => {
  const { t } = useLocalization();
  const filterItems = [
    {
      key: "keyword",
      title: t("admin.executive_dashboard.search_placeholder"),
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "period",
      title: t("admin.executive_dashboard.time_range_placeholder"),
      type: "multiSelect",
      className: "w-[230px]",
      options: [],
    },
  ] as FilterProps[];

  return (
    <LTTFilter
      filterItems={filterItems}
      onChange={(allValues) => {
        // Will dispatch filter action when store is connected
      }}
    />
  );
};

export default DashboardFilter;
