import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const FnbFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem san pham",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "category",
      title: "Danh muc",
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

export default FnbFilter;
