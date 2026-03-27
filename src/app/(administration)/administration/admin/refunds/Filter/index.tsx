import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const RefundsFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem hoan tra",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "status",
      title: "Trang thai",
      type: "multiSelect",
      className: "w-[230px]",
      options: [],
    },
    {
      key: "method",
      title: "Phuong thuc",
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

export default RefundsFilter;
