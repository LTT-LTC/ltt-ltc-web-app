import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const IncidentFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem su co",
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
      key: "severity",
      title: "Muc do",
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

export default IncidentFilter;
