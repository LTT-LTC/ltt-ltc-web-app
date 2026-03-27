import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const TenantsFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem tenant",
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

export default TenantsFilter;
