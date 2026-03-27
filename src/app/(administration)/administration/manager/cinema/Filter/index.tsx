import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const CinemaFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem rap",
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
