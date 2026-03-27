import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const DashboardFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem chi so",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "period",
      title: "Khoang thoi gian",
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
