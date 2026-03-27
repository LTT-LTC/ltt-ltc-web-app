import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const ShiftCloseFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem",
      type: "keyword",
      className: "w-[380px] py-3!",
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

export default ShiftCloseFilter;
