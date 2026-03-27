import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const ShiftReportFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem bao cao ca",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "shift",
      title: "Ca truc",
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

export default ShiftReportFilter;
