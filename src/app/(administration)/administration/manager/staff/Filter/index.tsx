import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const StaffFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem nhan vien",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "role",
      title: "Vai tro",
      type: "multiSelect",
      className: "w-[230px]",
      options: [],
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

export default StaffFilter;
