import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const SeatmapFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem phong chieu",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "cinema",
      title: "Rap",
      type: "multiSelect",
      className: "w-[230px]",
      options: [],
    },
    {
      key: "type",
      title: "Loai phong",
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

export default SeatmapFilter;
