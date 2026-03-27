import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const CrmFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem khach hang, SDT",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "type",
      title: "Loai su co",
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

export default CrmFilter;
