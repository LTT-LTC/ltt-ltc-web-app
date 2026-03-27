import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const MoviesFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem phim",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "genre",
      title: "The loai",
      type: "multiSelect",
      className: "w-[230px]",
      options: [],
    },
    {
      key: "rating",
      title: "Do tuoi",
      type: "multiSelect",
      className: "w-[230px]",
      options: [],
    },
    {
      key: "format",
      title: "Dinh dang",
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

export default MoviesFilter;
