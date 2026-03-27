import LTTFilter, { FilterProps } from "@/src/@core/component/LTTFilter";

const ServicePackagesFilter = () => {
  const filterItems = [
    {
      key: "keyword",
      title: "Tim kiem goi dich vu",
      type: "keyword",
      className: "w-[380px] py-3!",
    },
    {
      key: "type",
      title: "Loai goi",
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

export default ServicePackagesFilter;
