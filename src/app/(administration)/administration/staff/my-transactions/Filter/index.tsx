import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const MyTransactionsFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem giao dich",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "type",
      title: "Loai giao dich",
      type: "multiSelect",
      className: "w-[230px]",
      options: [],
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

export default MyTransactionsFilter;
