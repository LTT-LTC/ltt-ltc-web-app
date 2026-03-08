import clsx from "clsx";
import { FilterProps } from "..";
import LTTDatePicker from "../../AntD/LTTDatePicker";
import LTTFormItem from "../../AntD/LTTFormItem";
import LTTInput from "../../AntD/LTTInput";
import LTTSelect from "../../AntD/LTTSelect";
import LTTSearchEngineIcon from "../../LTTIcon/iconoir/search-engine";

type FilterItemsProps = {
  filterItems: FilterProps[];
};

const FilterItems = ({ filterItems }: FilterItemsProps) => {
  return filterItems.map((item: any, index: number) => {
    switch (item.type) {
      case "keyword":
        return (
          <LTTFormItem
            className={item?.className ?? ""}
            name={item.key}
            key={item?.key}
            rules={item?.rules ?? []}
          >
            <LTTInput
              showCount={item?.showCount ?? true}
              allowClear={item?.allowClear ?? true}
              label={`${item?.title.toLowerCase()}`}
              className={item?.className ?? ""}
              prefix={<LTTSearchEngineIcon />}
            />
          </LTTFormItem>
        );
      case "multiSelect":
        return (
          <LTTFormItem
            rules={item?.rules ?? []}
            className={clsx(item?.className) ?? ""}
            name={item.key}
            key={item?.key}
          >
            <LTTSelect
              mode="multiple"
              className="h-[48px]!"
              label={item?.title ?? ""}
              options={item?.options ?? []}
              allowClear={item?.allowClear ?? true}
            />
          </LTTFormItem>
        );
      case "singleSelect":
        return (
          <LTTFormItem
            rules={item?.rules ?? []}
            className={clsx(item?.className) ?? ""}
            name={item.key}
            key={item?.key}
          >
            <LTTSelect
              className="h-[48px]!"
              label={item?.title ?? ""}
              options={item?.options ?? []}
              allowClear={item?.allowClear ?? true}
            />
          </LTTFormItem>
        );
      case "dateTimePicker":
        return (
          <LTTFormItem
            rules={item?.rules ?? []}
            className={item?.className ?? ""}
            name={item.key}
            key={item?.key}
          >
            <LTTDatePicker label={item?.title ?? ""} />
          </LTTFormItem>
        );
    }
  });
};

export default FilterItems;
