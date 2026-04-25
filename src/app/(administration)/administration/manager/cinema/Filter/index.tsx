import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";
import { useLocalization } from "@/src/@core/hooks/use-localization";

const CinemaFilter = () => {
  const { t } = useLocalization();
  const filterItems = [
    {
      key: "keyword",
      title: t("admin.cinema_configuration.filter.keyword"),
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "status",
      title: t("admin.cinema_configuration.filter.status"),
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

export default CinemaFilter;
