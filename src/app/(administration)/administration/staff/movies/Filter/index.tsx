import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

export interface MoviesFilterProps {
  onSearch: (value: string) => void;
}

const MoviesFilter = ({ onSearch }: MoviesFilterProps) => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tìm kiếm phim",
      type: "keyword",
      className: "w-[380px] py-3!",
    }
  ] as FilterProps[];

  return (
    <LTTFilter
      filterItems={filterItems}
      onChange={(allValues) => {
        onSearch(allValues.keyword || "");
      }}
    />
  );
};

export default MoviesFilter;
