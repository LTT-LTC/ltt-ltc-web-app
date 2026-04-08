import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const ShowtimesFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem suat chieu",
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
      key: "movie",
      title: "Phim",
      type: "multiSelect",
      className: "w-[230px]",
      options: [],
    },
    {
      key: "room",
      title: "Phong",
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

export default ShowtimesFilter;
